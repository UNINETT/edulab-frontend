# edulab-frontend



To build docker image

```
bin/build.sh
```

and to run a development version with mounted dirs for development, add some config in a `ENV` file:

```
dataporten:clientID=bc2a7ac4-9ec0-4452-a58f-f64173c54f30
dataporten:clientSecret=7d9ad958-76d8-41c2-bd86-82563802f6c4
dataporten:sessionkey=ec5040a7-5aec-42c7-8ab3-f7d5c4149191
```

and run

```
bin/rundev.sh
```
