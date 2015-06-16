#!/bin/bash
echo $1
cd /var/www/html/scraper/db
php get_tweets.php $1 &
php parse_tweets.php $1 &

