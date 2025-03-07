/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1364355772")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE UNIQUE INDEX `idx_WPDPlSP9Gv` ON `ips` (`ip`)"
    ]
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1364355772")

  // update collection data
  unmarshal({
    "indexes": []
  }, collection)

  return app.save(collection)
})
