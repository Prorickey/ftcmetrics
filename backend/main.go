package main

import (
	"log"

	"github.com/Prorickey/ftcmetrics/database"
	"github.com/Prorickey/ftcmetrics/server"
)

func main() {
	err := database.MustConnect()
	if err != nil {
		log.Fatalf("database connect: %v", err)
	}

	router := server.SetupRouter()

	router.Run("0.0.0.0:8080")
}