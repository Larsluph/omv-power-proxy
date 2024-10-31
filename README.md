# omv-power-proxy

This is a proxy for power management of an OpenMediaVault server. It is a web server that listens for HTTP requests and forwards them to the appropriate power management command.

It uses OIDC for authentication and authorization.

## Build

To build the project, run the following command:

```bash
# Login to GitHub Container Registry
docker login ghcr.io -u larsluph
# Build image with tags
docker build -t ghcr.io/larsluph/omv-power-proxy:latest -t ghcr.io/larsluph/omv-power-proxy:$VERSION .
# Push image to registry
docker push ghcr.io/larsluph/omv-power-proxy -a
```
