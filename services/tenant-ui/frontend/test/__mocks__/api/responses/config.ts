const config = {
  frontend: {
    tenantProxyPath: 'http://localhost:8032',
    apiPath: 'api/',
    basePath: '/',
    showDeveloper: true,
    showInnkeeperReservationPassword: true,
    showInnkeeperAdminLogin: true,
    oidc: {
      active: false,
      authority:
        'https://dev.loginproxy.gov.bc.ca/auth/realms/digitaltrust-citz',
      client: 'innkeeper-frontend',
      label: 'IDIR',
    },
    ux: {
      appTitle: 'DigiCred CrMS Tenant Console',
      appInnkeeperTitle: 'DigiCred CrMS Innkeeper Console',
      sidebarTitle: 'DigiCred CrMS',
      copyright: '',
      owner: '',
      coverImageCopyright: 'Photo by Kristoffer Fredriksson on StockSnap',
      aboutBusiness: {
        title: 'DigiCred Holdings',
        linkTitle: 'DigiCred Holdings',
        link: 'https://github.com/DigiCred-Holdings/traction',
        imageUrl: '/img/digicred/digicred.png',
      },
    },
  },
  image: {
    buildtime: '',
    tag: 'tenant-ui:default',
    version: 'default',
  },
  server: {
    tractionUrl: 'http://localhost:5100',
  },
};

const plugins = {
  result: [
    'aries_cloudagent.holder',
    'aries_cloudagent.ledger',
    'aries_cloudagent.messaging.credential_definitions',
  ],
};

function setTenantProxyUrl(url: string) {
  config.frontend.tenantProxyPath = url;
}

export default {
  config,
  plugins,
  setTenantProxyUrl,
};
