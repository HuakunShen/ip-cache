package main

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/huakunshen/ip-geo-cache-pb/lib"
	_ "github.com/huakunshen/ip-geo-cache-pb/migrations"
	"github.com/joho/godotenv"
	"github.com/labstack/echo/v5"
	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/models"
	"github.com/pocketbase/pocketbase/plugins/migratecmd"
)

// Helper function to fetch IP info from the API
func fetchIpInfo(ip string, apiKey string) (*lib.IpInfo, error) {
	url := fmt.Sprintf("https://api.ipgeolocation.io/ipgeo?apiKey=%s&ip=%s", apiKey, ip)
	resp, err := http.Get(url)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	var ipInfo lib.IpInfo
	err = json.Unmarshal(body, &ipInfo)
	if err != nil {
		return nil, err
	}

	return &ipInfo, nil
}

// Helper function to save IP info to the database
func saveIpRecord(app *pocketbase.PocketBase, ip string, ipInfo *lib.IpInfo) (*models.Record, error) {
	ipCollection, err := app.Dao().FindCollectionByNameOrId("ips")
	if err != nil {
		return nil, err
	}

	ipRecord := models.NewRecord(ipCollection)
	ipRecord.Set("ip", ip)
	ipRecord.Set("info", ipInfo)
	ipRecord.Set("country", ipInfo.CountryName)
	ipRecord.Set("latitude", ipInfo.Latitude)
	ipRecord.Set("longitude", ipInfo.Longitude)

	if err := app.Dao().SaveRecord(ipRecord); err != nil {
		return nil, err
	}

	return ipRecord, nil
}

func main() {
	app := pocketbase.New()
	// load env if exists
	if _, err := os.Stat(".env"); err == nil {
		err := godotenv.Load()
		if err != nil {
			panic(err)
		}
	}
	// cwd, err := os.Getwd()
	// if err != nil {
	// 	log.Fatal(err)
	// }
	apiKey := os.Getenv("IP_GEOLOCATION_API_KEY")
	// create
	isGoRun := strings.HasPrefix(os.Args[0], os.TempDir()) || strings.Contains(os.Args[0], "JetBrains")
	fmt.Println("isGoRun", isGoRun)
	// migrationDir := ""

	// if isGoRun {
	// 	// join the current working directory with the migrations directory
	// 	migrationDir = cwd + "/migrations"
	// }
	migratecmd.MustRegister(app, app.RootCmd, migratecmd.Config{
		// enable auto creation of migration files when making collection changes in the Admin UI
		// (the isGoRun check is to enable it only during development)
		// Dir:         migrationDir,
		Automigrate: isGoRun,
	})

	app.OnBeforeServe().Add(func(e *core.ServeEvent) error {
		// e.Router.GET("/*", apis.StaticDirectoryHandler(os.DirFS("./pb_public"), false))
		// Basic IP info route
		e.Router.GET("/api/basic-ip-info/:ip", func(c echo.Context) error {
			ip := c.PathParam("ip")
			ipCache, err := app.Dao().FindFirstRecordByData("ips", "ip", ip)

			if ipCache == nil || err != nil {
				ipInfo, err := fetchIpInfo(ip, apiKey)
				if err != nil {
					return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
				}

				_, err = saveIpRecord(app, ip, ipInfo)
				if err != nil {
					return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
				}
				fmt.Println("cache miss for ip: ", ip)
				return c.JSON(http.StatusOK, map[string]interface{}{
					"country":   ipInfo.CountryName,
					"latitude":  ipInfo.Latitude,
					"longitude": ipInfo.Longitude,
				})
			}

			fmt.Println("cache hit for ip: ", ip)
			app.Logger().Info("Cache hit for ip: " + ip)
			return c.JSON(http.StatusOK, map[string]interface{}{
				"country":   ipCache.Get("country"),
				"latitude":  ipCache.Get("latitude"),
				"longitude": ipCache.Get("longitude"),
			})
		})

		// Full IP info route
		e.Router.GET("/api/full-ip-info/:ip", func(c echo.Context) error {
			ip := c.PathParam("ip")
			ipCache, err := app.Dao().FindFirstRecordByData("ips", "ip", ip)

			if ipCache == nil || err != nil {
				ipInfo, err := fetchIpInfo(ip, apiKey)
				if err != nil {
					return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
				}

				ipRecord, err := saveIpRecord(app, ip, ipInfo)
				if err != nil {
					return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
				}
				fmt.Println("cache miss for ip: ", ip)
				return c.JSON(http.StatusOK, ipRecord.Get("info"))
			}
			fmt.Println("cache hit for ip: ", ip)
			app.Logger().Info("Cache hit for ip: " + ip)
			return c.JSON(http.StatusOK, ipCache.Get("info"))
		})
		return nil
	})

	if err := app.Start(); err != nil {
		log.Fatal(err)
	}
}
