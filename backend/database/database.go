package database

import (
	"fmt"
	"os"

	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
)

var glob_db *sqlx.DB

func MustConnect() error {
	db, err := sqlx.Connect("postgres", "user=foo dbname=bar sslmode=disable")
	if err != nil {
		return fmt.Errorf("database connect: %v", err)
	}

	err = db.Ping()
	if err != nil {
		return fmt.Errorf("database ping: %v", err)
	}

	var schemaLocation string
	if os.Getenv("PROD") == "true" {
		schemaLocation = "/app/schema.sql"
	} else {
		schemaLocation = "./schema.sql"
	}

	file, err := os.ReadFile(schemaLocation)
	if err != nil {
		return fmt.Errorf("read schema: %v", err)
	}
	schema := string(file)

	_, err = db.Exec(schema)
	if err != nil {
		return fmt.Errorf("executing schema: %v", err)
	}

	glob_db = db

	return nil
}