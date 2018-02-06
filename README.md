# QRcode Tacking Dapp
[QRCodeChain.com](https://www.qrcodechain.com) is a proof of concept Dapp for tracking physical things using the blockchain.

## Tasks
- [x] Store and save data to ethereum blockchain
- [x] Host site on IPFS
- [x] Host site on HTTPs
- [x] Create and scan QR Codes
- [x] Add google map for tracking
- [ ] Setup e2e tests
- [ ] Dockerize Dapp
- [ ] Setup Angular Universal for SEO

## Technologies
1. [Angular](https://angular.io/)
2. [Clarity](https://vmware.github.io/clarity/)
3. [IPFS](https://ipfs.io/)
4. [Web3](https://github.com/ethereum/web3.js/)
5. [Solidity](https://github.com/ethereum/solidity)
6. [Remix IDE](https://remix.ethereum.org)
7. [Metamask](https://metamask.io/)
8. [QR Code](http://www.qrcode.com/en/index.html)


## Angular Development server

Run `npm run serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Angular Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Angular Build

Run `npm run build` to build the project.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Angular Help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).

## Install IPFS

Log in as root.

`sh ipfs.sh`

## Seutp IPFS
Now you could start the IPFS daemon with `ipfs daemon &`, but what you really want is that it automatically starts when the server boots.

Switch back to the `root` user:

```sh
exit
```

Allow the `ipfs` user to run long-running services by enabling user lingering for that user:

```sh
loginctl enable-linger ipfs
```

Create the file `/etc/systemd/system/ipfs.service` with this content:

```
[Unit]
Description=IPFS daemon

[Service]
User=ipfs
Group=ipfs
ExecStart=/usr/local/bin/ipfs daemon
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

Enable and start the service:

```sh
systemctl enable ipfs
systemctl start ipfs
```

Now IPFS should be up and running, and start when the server boots.

You should see peers pouring in:

```sh
su ipfs
ipfs swarm peers
```

## Add your website to IPFS

Now that you have IPFS running on your server, add your website.

```sh
ipfs add -r <path>
```

This adds all contents of the folder at `<path>` to IPFS, recursively. You should see output similar to this:

```
added QmcrBxpSJ8if6Uy7yZbtyXXsPuUmvT5KKfZKQi39kVJ5aW <folder>/images/fritz.png
added QmauwH6KDTGaTeAdQJbW9wZEGczjzSu9EceeasPUXo2qz9 <folder>/index.html
added Qmd9JiiVRTyyY1Tn2CWDLrkqqKFaMiwaAvAASTE88yyXAC <folder>/images
added QmaFrmEDFJXnYJb9hCrKDGs8XVvSUALzhv297W3uP97v2Y <folder>
```

Take note of the last hash (here: `QmaFrmED...`, yours will be different).

Publish this to IPNS:

```sh
ipfs name publish QmaFrmEDFJXnYJb9hCrKDGs8XVvSUALzhv297W3uP97v2Y
```

After a few moments, you should see output similar to this:

```
Published to <peer-id>: /ipfs/QmaFrmEDFJXnYJb9hCrKDGs8XVvSUALzhv297W3uP97v2Y
```

Take note of your `<peer-id>`.

Your website is now added to IPFS and published to IPNS under your IPFS node's peer ID. You can view your website on the `ipfs.io` gateway now: `https://ipfs.io/ipns/<peer-id>`. Or on any other gateway, like your local one at `localhost:8080`.

Repeat this procedure every time you change content in your website.

## Set up DNS

Go to `https://cloud.digitalocean.com/networking/domains/` and add your domain. Below we assume this domain is `example.com`, just replace that with you actual domain.

Add `A` records (and `AAAA` records if you want to support IPv6) for both your main domain `example.com` and the subdomain `ipfs.example.com`. The latter will be proxied to your local IPFS gateway so that it is publicly accessible.

Also add a `TXT` record for `example.com`, with the content `dnslink=/ipns/<peer-id>`.

![https://ipfs.io/ipfs/QmYCmFJEf1ymT7yKUoJUznKbYgwoR2Qq2Sx4F3VAR9pEri](https://ipfs.io/ipfs/QmYCmFJEf1ymT7yKUoJUznKbYgwoR2Qq2Sx4F3VAR9pEri)

DNS records take a while to propagate, so be patient.

## Install nginx with Let's Encrypt SSL certs

Log in as `root`.

Make sure the system is up to date, and install `nginx`:

```sh
apt-get update
apt-get install nginx
```

Edit `/etc/nginx/sites-available/default`. Change its contents to this:

```
server {
    server_name example.com ipfs.example.com;
    server_tokens off;

    listen 80;
    listen [::]:80;
    listen 443 ssl;
    listen [::]:443 ssl;

    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

This will proxy all requests to `example.com` and `ipfs.example.com` to your IPFS gateway running at `localhost:8080`.

Test your configuration:

```sh
nginx -t
```

If everything is okay, reload nginx:

```sh
systemctl reload nginx
```

Install Certbot:

```sh
add-apt-repository ppa:certbot/certbot
apt-get update
apt-get install python-certbot-nginx
```

Run Certbot to get your SSL certificates. Certbot supports nginx, and will update your configuration file automatically.

```sh
certbot --nginx -d example.com -d ipfs.example.com
```

Certbot will ask you to choose whether HTTPS access is required or optional (select the `Secure` option).

To harden security, update Diffie-Hellman parameters:

```sh
openssl dhparam -out /etc/ssl/certs/dhparam.pem 2048
```

Include this file somewhere in the `server` block of your nginx configuration `/etc/nginx/sites-available/default`, like this:

```
server {
    ...
    ssl_dhparam /etc/ssl/certs/dhparam.pem;
    ...
}
```

Again, test your configuration:

```sh
nginx -t
```

If everything is okay, reload nginx:

```sh
systemctl reload nginx
```

Let's Encrypt certificates expire after 90 days, so you should have means in place to update them automatically. Crontabs are a good way to do that:

```sh
crontab -e
```

Add the following line to the end of the file:

```
15 3 * * * /usr/bin/certbot renew --quiet
```

This will run `certbot renew --quiet` every day at 3:15am. It checks if the certificates expire soon (in 30 days or less), and if they do, renews them.

Now if you go to `https://example.com`, you should see the website you added to IPFS above.

## Sources

* [Run IPFS latest on a VPS](https://ipfs.io/blog/22-run-ipfs-on-a-vps/)
* [A short guide to hosting your site on ipfs](https://ipfs.io/ipfs/QmRFTtbyEp3UaT67ByYW299Suw7HKKnWK6NJMdNFzDjYdX/websites/README.md)
* [How To Install Nginx](https://www.digitalocean.com/community/tutorials/how-to-install-nginx-on-ubuntu-16-04)
* [How To Secure Nginx with Let's Encrypt](https://www.digitalocean.com/community/tutorials/how-to-secure-nginx-with-let-s-encrypt-on-ubuntu-16-04)
* [How To Host Multiple Node.js Applications On a Single VPS](https://www.digitalocean.com/community/tutorials/how-to-host-multiple-node-js-applications-on-a-single-vps-with-nginx-forever-and-crontab)