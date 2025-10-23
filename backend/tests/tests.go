package tests

import (
	"log"

	"github.com/Prorickey/ftcmetrics/database"
)

func SetupDatabaseForTests() {
	err := database.MustConnect()
	if err != nil {
		log.Fatalf(
			`Uh oh! The database was unable to connect for your tests. If you are running this locally, you'll
			need to spin up a local postgres database and ensure the environment variables are set correctly. The 
			README.md should specify how to do this. If this is failing in a CI workflow, your commit to modify 
			tests was faulty and somehow broke everything... please rollback and try again :)

			database connect: %v`, err)
	}
}