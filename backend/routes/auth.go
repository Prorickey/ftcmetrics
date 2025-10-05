package routes

import (
	"log"

	"github.com/Prorickey/ftcmetrics/database"
	"github.com/alexedwards/argon2id"
	"github.com/gin-gonic/gin"
)

func RegisterAuthRoutes(engine *gin.Engine) {
	engine.Group("/auth"); {

	}
}

type registerUserBody struct {
	Username string `json:"username"`;
	Email string `json:"email"`;
	Password string `json:"password"`;
}

// POST
func registerUser(ctx *gin.Context) {
	var body registerUserBody
	err := ctx.ShouldBindBodyWithJSON(&body)
	if err != nil {
		log.Printf("error unmarshaling json: %v", err)
		ctx.JSON(400, gin.H{"error": "malformed body"})
		return
	}

	digest, err := argon2id.CreateHash(body.Password, argon2id.DefaultParams)
	if err != nil {
		log.Printf("error hashing password: %v", err)
		ctx.JSON(500, gin.H{"error": "internal server error"})
		return
	}

	user, err := database.CreateUser(body.Username, body.Email, digest)
	if err != nil {
		if user.Username == "exists" {
			ctx.JSON(409, gin.H{"error": "username or email already taken"})
			return
		}

		log.Printf("creating user: %v", err)
		ctx.JSON(500, gin.H{"error": "internal server error"})
		return 
	}

	// TODO: Create refresh and access token for user
}