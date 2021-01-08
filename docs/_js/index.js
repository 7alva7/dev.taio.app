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
    EditOnGithubPlugin.create('', null, path => {
      if (path.indexOf('cn/') === 0) {
        return '在 GitHub 上查看';
      } else {
        return 'Read on GitHub';
      }
    }),
    (hook, vm) => {
      hook.afterEach(html => {
        const path = vm.route.path;
        if (path.indexOf('/cn/') !== -1) {
          return html + '<footer>感谢阅读，您也可以通过 <a href="https://dev.taio.app/cn/feed.xml" target="_blank">RSS</a> 订阅我们的最新文章。</footer>';
        } else {
          return html + '<footer>Thanks for reading, you can also subscribe our latest articles using <a href="https://dev.taio.app/feed.xml" target="_blank">RSS</a>.</footer>';
        }
      });
      hook.doneEach(() => {
        const path = vm.route.path;
        localizePageTitle(path.indexOf('/cn/') !== -1);

        const editButton = document.querySelector('a[onclick^="EditOnGithubPlugin"]');
        if (editButton) {
          editButton.onclick = event => {
            const link = 'https://github.com/cyanzhong/dev.taio.app/blob/master/docs/' + vm.route.file;
            window.open(link)
            event.preventDefault();
          }
        }
      });
    }
  ],
  'flexible-alerts': {
    note: {
      label: {
        '/cn/': '最后更新',
        '/': 'Last Updated'
      }
    }
  }
};

function localizePageTitle(cn) {
  const titles = {
    en: 'Taio Dev Notes',
    cn: 'Taio 开发笔记',
  }

  if (cn) {
    if (document.title === titles.en) {
      document.title = titles.cn;
    }
  } else {
    if (document.title === titles.cn) {
      document.title = titles.en;
    }
  }
}