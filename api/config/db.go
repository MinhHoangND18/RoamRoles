package config

import (
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

func InitDB(dsn string) (db *gorm.DB, err error) {
	return gorm.Open(mysql.Open(dsn), &gorm.Config{})
}
