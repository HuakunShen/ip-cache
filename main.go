package main

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/huakunshen/ip-cache/lib"
	_ "github.com/huakunshen/ip-cache/migrations"
	"github.com/joho/godotenv"
	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/plugins/migratecmd"
)

func main() {
	app := pocketbase.New()
	if _, err := os.Stat(".env"); err == nil {
		err := godotenv.Load()
		if err != nil {
			panic(err)
		}
	}
	apiKey := os.Getenv("IP_GEOLOCATION_API_KEY")
	// isGoRun := strings.HasPrefix(os.Args[0], os.TempDir()) || strings.Contains(os.Args[0], "JetBrains")
	// fmt.Println("isGoRun", isGoRun)
	isGoRun := strings.HasPrefix(os.Args[0], os.TempDir())
	fmt.Println("os.Args[0]", os.Args[0])
	fmt.Println("os.TempDir()", os.TempDir())
	fmt.Println("isGoRun", isGoRun)
	migratecmd.MustRegister(app, app.RootCmd, migratecmd.Config{
		// enable auto creation of migration files when making collection changes in the Dashboard
		// (the isGoRun check is to enable it only during development)
		Automigrate: isGoRun,
	})

	app.OnServe().BindFunc(func(se *core.ServeEvent) error {
		// serves static files from the provided public dir (if exists)
		// se.Router.GET("/{path...}", apis.Static(os.DirFS("./pb_public"), false))
		se.Router.GET("/api/ip-geo/{ip}", func(e *core.RequestEvent) error {
			ip := e.Request.PathValue("ip")
			record, err := app.FindFirstRecordByData("ips", "ip", ip)

			if record == nil || err != nil || !isCacheValid(record) {
				ipInfo, err := fetchIpInfo(ip, apiKey)
				if err != nil {
					return e.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
				}

				record, err = saveIpRecord(app, ip, ipInfo)
				if err != nil {
					return e.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
				}
				fmt.Println("cache miss for ip: ", ip)
			} else {
				fmt.Println("cache hit for ip: ", ip)
				app.Logger().Info("Cache hit for ip: " + ip)
			}

			var info lib.IpInfo
			record.UnmarshalJSONField("info", &info)
			return e.JSON(http.StatusOK, map[string]interface{}{
				"country":   info.CountryName,
				"latitude":  info.Latitude,
				"longitude": info.Longitude,
			})
		})

		se.Router.GET("/api/info/{ip}", func(e *core.RequestEvent) error {
			ip := e.Request.PathValue("ip")
			ipCache, err := app.FindFirstRecordByData("ips", "ip", ip)
			if ipCache == nil || err != nil || !isCacheValid(ipCache) {
				ipInfo, err := fetchIpInfo(ip, apiKey)
				if err != nil {
					return e.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
				}

				ipRecord, err := saveIpRecord(app, ip, ipInfo)
				if err != nil {
					return e.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
				}
				fmt.Println("cache miss for ip: ", ip)
				return e.JSON(http.StatusOK, ipRecord.Get("info"))
			}
			fmt.Println("cache hit for ip: ", ip)
			app.Logger().Info("Cache hit for ip: " + ip)
			return e.JSON(http.StatusOK, ipCache.Get("info"))
		})

		return se.Next()
	})

	if err := app.Start(); err != nil {
		log.Fatal(err)
	}
}

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
func saveIpRecord(app *pocketbase.PocketBase, ip string, ipInfo *lib.IpInfo) (*core.Record, error) {
	ipCollection, err := app.FindCollectionByNameOrId("ips")
	if err != nil {
		return nil, err
	}

	ipRecord := core.NewRecord(ipCollection)
	ipRecord.Set("ip", ip)
	ipRecord.Set("info", ipInfo)
	ipRecord.Set("country", ipInfo.CountryName)
	ipRecord.Set("latitude", ipInfo.Latitude)
	ipRecord.Set("longitude", ipInfo.Longitude)

	if err := app.Save(ipRecord); err != nil {
		return nil, err
	}

	return ipRecord, nil
}

// Helper function to check if cache is valid
func isCacheValid(record *core.Record) bool {
	updated := record.Collection().Updated
	// Cache invalidation after 7 days
	return time.Since(updated.Time()) < 7*24*time.Hour
}
