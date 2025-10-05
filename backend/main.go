package main

import (
	"log"

	"github.com/Prorickey/ftcmetrics/database"
	"github.com/Prorickey/ftcmetrics/routes"
	"github.com/gin-gonic/gin"
)

func main() {
	err := database.MustConnect()
	if err != nil {
		log.Fatalf("database connect: %v", err)
	}

	router := gin.New()

	routes.RegisterAuthRoutes(router)

	router.Run("0.0.0.0:8080")
}