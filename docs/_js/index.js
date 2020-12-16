localizePageTitle(location.href.indexOf('/#/cn/') !== -1);

window.$docsify = {
  alias: {
    '/((?!cn).)*/_sidebar.md': '/_sidebar.md',
    '/((?!cn).)*/_navbar.md': '/_navbar.md',
    '/cn/.*/_sidebar.md': '/cn/_sidebar.md',
    '/cn/.*/_navbar.md': '/cn/_navbar.md'
  },
  auto2top: true,
  coverpage: false,
  executeScript: true,
  loadSidebar: true,
  loadNavbar: true,
  mergeNavbar: true,
  maxLevel: 4,
  subMaxLevel: 2,
  name: 'Taio',
  search: {
    noData: {
      '/cn/': '没有结果',
      '/': 'No results'
    },
    paths: 'auto',
    placeholder: {
      '/cn/': '搜索',
      '/': 'Search'
    }
  },
  formatUpdated: '{MM}/{DD} {HH}:{mm}',
  plugins: [
    EditOnGithubPlugin.create('https://github.com/cyanzhong/dev.taio.app/blob/master/docs/', null, path => {
      if (path.indexOf('cn/') === 0) {
        return '在 GitHub 上编辑';
      } else {
        return 'Edit on GitHub';
      }
    }),
    (hook, vm) => {
      hook.doneEach(() => {
        const path = vm.route.path;
        localizePageTitle(path.indexOf('/cn/') !== -1);
      });
    }
  ]
};

function localizePageTitle(cn) {
  const titles = {
    en: 'Taio Dev Notes',
    cn: 'Taio 开发笔记',
  }

  if (cn && document.title === titles.en) {
    document.title = titles.cn;
  } else if (document.title === titles.cn) {
    document.title = titles.en;
  }
}