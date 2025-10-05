package database

import (
	"fmt"
	"time"

	"github.com/Prorickey/ftcmetrics/types"
)

func CreateUser(username string, email string, digest string) (types.User, error) {
	tx, err := glob_db.Beginx()
	if err != nil {
		return types.User{}, fmt.Errorf("beginning transaction: %v", err)
	}

	defer tx.Rollback()

	var results struct {
		ID string `db:"id"`
		Username string `db:"username"`
		CreatedAt time.Time `db:"created_at"`
	}

	err = tx.Select(&results, `
		WITH ins AS (
			INSERT INTO users (username, email, digest) 
			VALUES($1, $2, $3) 
			ON CONFLICT(username, email) 
			RETURNING id, username, created_at
		)
		SELECT id, username, created_at FROM ins
		UNION ALL
		SELECT id, username, created_at FROM users 
		WHERE (username=$1 OR email=$2) AND NOT EXISTS (SELECT 1 FROM ins)
	`, username, email, digest)

	if err != nil {
		return types.User{}, fmt.Errorf("insert new user: %v", err)
	}

	if results.Username == username {
		return types.User{
			ID: results.ID,
			Username: username,
			Email: email,
			CreatedAt: results.CreatedAt,
		}, nil
	} else {
		return types.User{
			Username: "exists",
		}, fmt.Errorf("username or email already taken")
	}
}