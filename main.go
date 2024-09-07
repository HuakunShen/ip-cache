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
		// get request: /api/<ip>
		e.Router.GET("/api/:ip", func(c echo.Context) error {
			ip := c.PathParam("ip")
			// check if ip is in the ips collection
			ipCollection, err := app.Dao().FindCollectionByNameOrId("ips")
			if err != nil {
				fmt.Println("after find collection", err)
				return c.JSON(http.StatusInternalServerError, err)
			}
			ipCache, err := app.Dao().FindFirstRecordByData("ips", "ip", ip)
			if ipCache == nil || err != nil {
				// https://api.ipgeolocation.io/ipgeo?apiKey={ip}&ip={ip}
				// send request to ipgeolocation
				url := fmt.Sprintf("https://api.ipgeolocation.io/ipgeo?apiKey=%s&ip=%s", apiKey, ip)
				app.Logger().Debug("Sending request to ipgeolocation: ", "url", url)

				resp, err := http.Get(url)
				if err != nil {
					fmt.Println(err)
					return c.JSON(http.StatusInternalServerError, err)
				}
				defer resp.Body.Close()
				body, err := io.ReadAll(resp.Body)
				if err != nil {
					return c.JSON(http.StatusInternalServerError, err)
				}

				// model defined in lib/model.go as IpInfo
				var ipInfo lib.IpInfo
				err = json.Unmarshal(body, &ipInfo)
				if err != nil {
					return c.JSON(http.StatusInternalServerError, err)
				}
				app.Logger().Info("Cache not hit for ip: ", "ip", ip, "body", ipInfo)

				// save to ips collection
				ipRecord := models.NewRecord(ipCollection)
				ipRecord.Set("ip", ip)
				ipRecord.Set("info", ipInfo)
				ipRecord.Set("country", ipInfo.CountryName)
				ipRecord.Set("latitude", ipInfo.Latitude)
				ipRecord.Set("longitude", ipInfo.Longitude)
				app.Dao().SaveRecord(ipRecord)
				return c.JSON(http.StatusOK, ipRecord)
			} else {
				app.Logger().Info("Cache hit for ip: " + ip)
				return c.JSON(http.StatusOK, ipCache)
			}
		})
		return nil
	})

	if err := app.Start(); err != nil {
		log.Fatal(err)
	}
}
