package config

import (
	"github.com/spf13/viper"
)

type Config struct {
	Port      string `mapstructure:"PORT"`
	Host      string `mapstructure:"HOST"`
	DbUrl     string `mapstructure:"DB_URL"`
	ApiSecret string `mapstructure:"API_SECRET"`
}

func LoadConfig(path string) (config Config, err error) {
	viper.AddConfigPath(path)
	viper.SetConfigName(".env")
	viper.SetConfigType("env")

	viper.AutomaticEnv()

	err = viper.ReadInConfig()
	if err != nil {
		return
	}

	err = viper.Unmarshal(&config)
	return
}
