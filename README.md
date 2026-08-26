# CMDS Assets

Public static assets for CMDS, served at [assets.cmds.app](https://assets.cmds.app) via GitHub Pages.

Logos, banners, icons, animations, and other web-visible resources shared across CMDS projects and partners.

## Repository layout

| Folder                       | Purpose |
| :--------------------------- | :------ |
| `img/animations/{gif,lottie}` | Animated graphics |
| `img/banners/{hero,promo,partners}` | Banner images |
| `img/icons/{ui,status,social}` | Iconography (SVG, PNG, ICO) |
| `img/illustrations`          | Decorative illustrations |
| `img/logos/cmds`             | CMDS product logos |
| `img/logos/miller`           | Miller company logos |
| `img/logos/partners`         | Partner organization logos |
| `img/logos/third-party`      | Vendor and third-party tool logos |
| `img/photos`                 | Photographic content |
| `img/screenshots`            | Product screenshots |
| `video/{tutorials,promo,partners}` | Video content |
| `fonts`                      | Self-hosted web fonts |
| `downloads`                  | Downloadable archives, installers, sample data |
| `previews`                   | HTML viewers and demo pages for assets |

Files are served at the root of `assets.cmds.app`. For example, `img/logos/cmds/logo-light.png` is reachable at `https://assets.cmds.app/img/logos/cmds/logo-light.png`.

## Adding assets

1. Drop files into the appropriate folder. Create a new subfolder if none fits.
2. Prefer SVG for vector art and WebP/AVIF for raster where supported.
3. Use lowercase, hyphenated filenames: `acme-corp-logo.svg`, not `Acme Corp Logo.SVG`.
4. For brands with multiple variants, use suffixes: `logo-full`, `logo-mark`, `logo-wordmark`, `logo-dark`, `logo-light`, `logo-mono`.
5. Commit on a feature branch and open a PR.

## Deployment

Pushes to `main` publish to GitHub Pages. The `assets.cmds.app` custom domain is configured in repo **Settings → Pages**.

## Caching and versioning

GitHub Pages applies short-lived Fastly cache headers. For aggressive cache-busting, version the path (`img/logos/v2/acme.svg`) rather than overwriting in place — consumers may hold cached references.

## Contributing

Contribution guidelines live in [cmds-app/.github](https://github.com/cmds-app/.github) and apply to every CMDS project.

## License

[MIT](LICENSE)
