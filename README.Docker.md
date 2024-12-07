### Building and running your application

When you're ready, start your application by running:
```shell
# Set new version in current context
$VERSION=Read-Host "Enter version to create (X.Y.Z): "
# Bump package version
npm version $VERSION --no-commit-hooks --no-git-tag-version
# Login to GitHub Container Registry
docker login ghcr.io -u larsluph
# Build image with tags
docker build -t ghcr.io/larsluph/omv-power-proxy:latest -t ghcr.io/larsluph/omv-power-proxy:$VERSION .
# Push image to registry
docker push ghcr.io/larsluph/omv-power-proxy -a
# Create release commit
git commit -am "$VERSION Release"
# Tag release
git tag $VERSION
# Push release
git push origin
git push origin tag $VERSION
```

Your application will be available at http://localhost:3000.

### References
* [Docker's Node.js guide](https://docs.docker.com/language/nodejs/)
