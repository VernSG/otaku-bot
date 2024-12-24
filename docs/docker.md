# Build image local

```
docker build -t otakubot .
```

# Cek images yang telah di build

```
docker images
```

# Jalankan container dengan image yang telah dibangun

```
sudo docker run -d \
 --name otakubot \
 -v $(pwd)/sessions:/app/sessions \
 vernsg/otakubot:latest
```

# Periksa apakah container berjalan

```
docker ps
```

# Check logs

```
docker logs -f otakubot
```

# Stop docker

```
sudo docker stop otakubot
```

# Start docker jika sudah ada container

```
sudo docker start otakubot
```
