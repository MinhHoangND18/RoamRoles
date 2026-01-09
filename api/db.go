package main

import (
	"database/sql"
	"log"

	_ "github.com/go-sql-driver/mysql"
)

var DB *sql.DB

func InitDB() {
	dsn := "root:@tcp(127.0.0.1:3306)/roamroles_db?charset=utf8mb4&parseTime=True"

	var err error
	DB, err = sql.Open("mysql", dsn)
	if err != nil {
		log.Fatal(err)
	}

	if err = DB.Ping(); err != nil {
		log.Fatal("Can't connect to DB:", err)
	}

	log.Println("MySQL connected")
}
