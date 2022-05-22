import { select, classNames } from './settings.js';
import Pathfinder from './components/pathfinder.js';

const app = {
  getDomElements: function() {
    const thisApp = this;

    thisApp.dom = {};
    thisApp.dom.pages = document.getElementById(select.containerOf.pagesId).children;
    thisApp.dom.navlinks = document.querySelectorAll(select.nav.links);
  },
  initLinks: function() {
    const thisApp = this;

    for (let link of thisApp.dom.navlinks) {
      link.addEventListener('click', function(event) {
        event.preventDefault();
        const idFromLink = event.target.href.split('#')[1];
        thisApp.activatePage(idFromLink);
        window.location.hash = `#/${idFromLink}`;
      });
    }
  },
  initPages: function() {
    const thisApp = this;

    const idFromHash = window.location.hash.replace('#/', '');
    let pageMatchingHash = thisApp.dom.pages[0].id;
    for (let page of thisApp.dom.pages) {
      if (page.id === idFromHash) {
        pageMatchingHash = page.id;
        break;
      }
    }
    thisApp.activatePage(pageMatchingHash);
  },
  activatePage: function(pageId) {
    const thisApp = this;

    /* Add class "active" to matching page, remove from non-matching */
    for (let page of thisApp.dom.pages) {
      page.classList.toggle(classNames.pages.active, page.id === pageId);
    }
    /* Add class "active" to matching link, remove from non-matching */
    for (let link of thisApp.dom.navlinks) {
      link.classList.toggle(
        classNames.nav.active,
        link.getAttribute('href') === `#${pageId}`
      );
    }
  },

  init: function() {
    const thisApp = this;

    thisApp.getDomElements();
    thisApp.initLinks();
    thisApp.initPages();
    thisApp.pathfinder = new Pathfinder();
  }
};

app.init();
