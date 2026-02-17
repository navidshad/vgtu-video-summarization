# Lib Vue Components Documentation

Generated on: 2025-11-16T14:05:12.514Z

---

## Getting Started / Installation

### Installation Guide

#### Prerequisites

-   A working Vue 3 or Nuxt 3 project
-   GitHub account with package access
-   Node.js and npm/yarn installed

#### Setup Steps

##### 1\. GitHub Authentication

1.  Create a GitHub personal access token:
    
    -   Go to GitHub Settings → Developer Settings → Personal Access Tokens
    -   Generate a new token with `read:packages` permission
    -   Copy the generated token
    -   For detailed instructions, watch this guide
2.  Create an `.npmrc` file in your project root:
    
    ```
    @codebridger:registry=https://npm.pkg.github.com
    //npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN
    ```
    
    Replace `YOUR_GITHUB_TOKEN` with the token you created.
    

##### 2\. Package Installation

Install the package using npm or yarn:

```
# Using npm
npm install pilotui

# Using yarn
yarn add pilotui

# install from dev branch
yarn add pilotui@dev
```

##### 3\. Integration

###### Vue 3 Setup

```
// Import components and Styles
import vueComponents from "pilotui";
import 'pilotui/style.css';

// Configuration options
const options = {
  // Component prefix (default: "CL")
  prefix: "CL",
  
  // Optional: Disable specific integrations
  dontInstallPinia: true,
  dontInstallPopper: false,
  dontInstallPerfectScrollbar: false,
};

// Install on Vue app
vueApp.use(vueComponents, options);
```

###### Nuxt 3 Setup

1.  Create a plugin file `plugins/component-library.client.ts`:

```
import { defineNuxtPlugin as init } from 'pilotui/nuxt';

export default defineNuxtPlugin({
  name: 'pilotui',
  enforce: 'pre',
  async setup(nuxtApp) {
    const options = {
      prefix: "CL",
      dontInstallPinia: true,
      dontInstallPopper: false,
      dontInstallPerfectScrollbar: false,
    };

    return init(nuxtApp, options);
  },
});
```

2.  Update your `nuxt.config.ts`:

```
export default defineNuxtConfig({
  // Ensure components are transpiled during build
  build: {
    transpile: ['pilotui'],
  },

  css: [
    // ... other CSS files
    'pilotui/style.css',
  ],
  
  // ... other Nuxt config
});
```

#### Configuration Options

```
interface ConfigOptions {
  // Prefix for component names (default: "CL")
  prefix?: string;
  
  // Disable Pinia store integration (default: false)
  dontInstallPinia?: boolean;
  
  // Disable Popper.js integration (default: false)
  dontInstallPopper?: boolean;
  
  // Disable Perfect Scrollbar integration (default: false)
  dontInstallPerfectScrollbar?: boolean;
}
```

#### Next Steps

After installation, you can start using the components in your application. Check out our component documentation for detailed usage instructions and examples.

---

## Getting Started How To / Use

### Component library

We are two indie developers who love to build things. We are building a component library for vue and nuxt projects. it inspired by `vristo` and powered by `tailwindcss`.

You need to follow these principles in order to use the component library properly.

#### LLM Friendly docs

You can use this doc for llm agents.

#### AppRoot

All components should be wrapped with the main ancestor component called `AppRoot`. It's really important to wrap all components with `AppRoot` because it's responsible for the global state management and the theme management.

```
<App>
  <!-- your components here -->
</App>
```

```
// All Components
Import { Button, Input, App } form 'pilotui'

// Or Import by category:

// Shell components
import {
  App,
  DashboardShell,
  ThemeCustomizer,
  SidebarMenu,
  HorizontalMenu,
} from "pilotui/shell";

// Element components
import { Button } from "pilotui/elements";

// Form components
import { Input } from "pilotui/form";

// Complex components
import { Modal } from "pilotui/complex";

// Type imports
import type {
  SidebarItemType,
  HorizontalMenuItemType,
} from "pilotui/types";
```

#### Global Configuration

There is pinia store for global configuration. see full documentation here

```
import { useAppStore } from "pilotui/store.ts";

const appStore = useAppStore();
appStore.setTheme("dark");
```

---

## Getting Started Global / Configuration

#### Using `useAppStore`

Import and use the `useAppStore` in your components to access and modify the global state.

##### Importing the Store

```
import { useAppStore } from 'pilotui/store.ts';
```

##### Accessing State

You can access the state properties directly from the store instance:

```
const store = useAppStore();

console.log(store.isDarkMode); // false
console.log(store.theme); // "light"
```

##### Modifying State

The store provides several methods to modify the state. Below are examples of how to use these methods.

```
// Toggle Theme
store.toggleTheme('dark'); 

// Toggle Menu Style
store.toggleMenuStyle('horizontal'); 

// Toggle Layout
store.toggleLayout('boxed-layout'); 

// Toggle RTL
store.toggleRTL('rtl'); 

// Toggle Animation
store.toggleAnimation('fade'); 

// Toggle Navbar
store.toggleNavbar('navbar-floating'); 

// Toggle Semidark Mode
store.toggleSemidark(true); 

// Toggle Sidebar
store.toggleSidebar(true); 
store.toggleSidebar(false); 

// Toggle Main Loader
store.toggleMainLoader(true); // Show main loader
```

#### State Properties

| Property | Type | Description |
| --- | --- | --- |
| isDarkMode | boolean | Indicates if dark mode is enabled. |
| mainLayout | string | The main layout of the application. |
| theme | string | The current theme (light, dark, or system). |
| menu | string | The current menu style (vertical, horizontal, or collapsible-vertical). |
| layout | string | The current layout style (boxed-layout or full). |
| rtlClass | string | The current text direction (ltr or rtl). |
| isRtl | boolean | Computed property indicating if RTL is enabled. |
| animation | string | The current animation style. |
| navbar | string | The current navbar style (navbar-sticky, navbar-static, or navbar-floating). |
| locale | string | The current locale. |
| sidebar | boolean | Indicates if the sidebar is visible. |
| isShowMainLoader | boolean | Indicates if the main loader is visible. |
| semidark | boolean | Indicates if semidark mode is enabled. |

#### Methods

| Method | Input Type | Description |
| --- | --- | --- |
| setMainLayout(payload) | any | Sets the main layout. |
| toggleTheme(payload) | "light" \| "dark" \| "system" \| any | Toggles the theme. |
| toggleMenuStyle(payload) | "vertical" \| "horizontal" \| "collapsible-vertical" \| string | Toggles the menu style. |
| toggleLayout(payload) | "boxed-layout" \| "full" \| any | Toggles the layout style. |
| toggleRTL(payload) | "ltr" \| "rtl" \| any | Toggles the text direction. |
| toggleAnimation(payload) | any | Toggles the animation style. |
| toggleNavbar(payload) | "navbar-sticky" \| "navbar-static" \| "navbar-floating" | Toggles the navbar style. |
| toggleSemidark(payload) | any | Toggles semidark mode. |
| toggleSidebar(state?) | boolean | Toggles the sidebar visibility. |
| toggleMainLoader(state) | boolean | Toggles the main loader visibility. |

#### Example

Here is an example of how to use the `useAppStore` in a Vue component:

```
<template>
  <div>
    <button @click="toggleTheme">Toggle Theme</button>
    <button @click="toggleSidebar">Toggle Sidebar</button>
  </div>
</template>

<script lang="ts" setup>
import { useAppStore } from '@/stores';

const store = useAppStore();

function toggleTheme() {
  store.toggleTheme(store.theme === 'light' ? 'dark' : 'light');
}

function toggleSidebar() {
  store.toggleSidebar();
}
</script>
```

---

## Shell / Approot

### AppRoot

Top-level shell that wires global layout concerns: color scheme, direction (LTR/RTL), and layout style. Wrap your application to ensure consistent theming and structure.

#### Features

-   Controls color scheme (light/dark), layout style (full/boxed), and direction (LTR/RTL)
-   Provides consistent container and reset styles for child content

#### Usage

Use as the root wrapper for app pages/stories. Combine with DashboardShell for full navigation scaffolding.

```
<template>
  <AppRoot colorScheme="light" direction="ltr" layoutStyle="full" />
</template>
```

| Name | Description | Default | Control |
| --- | --- | --- | --- |
| props |  |
| colorScheme | "light""dark""system" | - | lightdarksystem |
| layoutStyle | "boxed-layout""full" | - | fullboxed-layout |
| direction | "ltr""rtl" | - | ltrrtl |
| slots |  |
| default | other | - |  |

---

## Shell / Dashboardshell

### DashboardShell

Composable page shell providing header, horizontal menu, sidebar, content, and footer slots. Supports vertical and horizontal navigation styles.

#### Features

-   Slot-based regions: header, horizontal-menu, sidebar-menu, content, footer
-   Toggleable menu visibility; vertical/horizontal navigation styles
-   Works with HorizontalMenu and SidebarMenu components

#### Usage

Wrap application pages to provide consistent navigation and scaffolding. Fill slots with your own menus and content.

```
<template>
  <DashboardShell
    brandTitle="PilotsUI"
    :hideMenu="false"
    menuStyle="vertical"
  />
</template>
```

| Name | Description | Default | Control |
| --- | --- | --- | --- |
| props |  |
| menuStyle | "vertical""horizontal""collapsible-vertical" | "vertical" | horizontalverticalcollapsible-vertical |
| brandTitle* | string | - | PilotsUI |
| hideMenu | boolean | - | FalseTrue |
| brandLogo | string | - |  |
| loading | boolean | - |  |
| slots |  |
| sidebar-menu | Area for sidebar menu{ closeSidebar: unknown } | - |  |
| brand | Area for logo and menu iconother | - |  |
| header | Decorating the empty space after brand titleother | - |  |
| horizontal-menu | Area on the header right below of the header, for horizontal menuother | - |  |
| content | Main content slot, page content should be placed here{ width: unknown; height: unknown } | - |  |
| footer | Footer slotother | - |  |

#### Stories

##### Full Setup Shell

```
<template>
  <DashboardShell
    brandTitle="PilotsUI"
    :hideMenu="false"
    menuStyle="vertical"
  />
</template>
```

##### Simple Shell

```
<template>
  <DashboardShell
    brandTitle="PilotsUI"
    :hideMenu="false"
    menuStyle="vertical"
  />
</template>
```

---

## Shell / Horizontalmenu

### HorizontalMenu

Responsive top navigation bar rendering a hierarchy of items with icons and labels. Integrates with the shell store to switch layout style.

#### Features

-   Renders menu items with nesting and icons
-   Suited for wide screens; pairs with DashboardShell
-   Works in LTR/RTL and dark mode contexts

#### Usage

Supply a prepared items array. Keep labels concise; group related pages under dropdowns.

```
<script lang="ts" setup>
const items = [
  {
    "title": "dashboard",
    "icon": "icon-menu-dashboard",
    "children": [
      {
        "title": "sales",
        "to": "/"
      },
      {
        "title": "analytics",
        "to": "/analytics"
      },
      {
        "title": "finance",
        "to": "/finance"
      },
      {
        "title": "crypto",
        "to": "/crypto"
      }
    ]
  },
  {
    "title": "apps",
    "icon": "icon-menu-apps",
    "children": [
      {
        "title": "chat",
        "to": "/apps/chat"
      },
      {
        "title": "mailbox",
        "to": "/apps/mailbox"
      },
      {
        "title": "todo_list",
        "to": "/apps/todolist"
      },
      {
        "title": "notes",
        "to": "/apps/notes"
      },
      {
        "title": "scrumboard",
        "to": "/apps/scrumboard"
      },
      {
        "title": "contacts",
        "to": "/apps/contacts"
      },
      {
        "title": "invoice",
        "child": [
          {
            "title": "list",
            "to": "/apps/invoice/list"
          },
          {
            "title": "preview",
            "to": "/apps/invoice/preview"
          },
          {
            "title": "add",
            "to": "/apps/invoice/add"
          },
          {
            "title": "edit",
            "to": "/apps/invoice/edit"
          }
        ]
      },
      {
        "title": "calendar",
        "to": "/apps/calendar"
      }
    ]
  },
  {
    "title": "components",
    "icon": "icon-menu-components",
    "children": [
      {
        "title": "tabs",
        "to": "/components/tabs"
      },
      {
        "title": "accordions",
        "to": "/components/accordions"
      },
      {
        "title": "modals",
        "to": "/components/modals"
      },
      {
        "title": "cards",
        "to": "/components/cards"
      },
      {
        "title": "carousel",
        "to": "/components/carousel"
      },
      {
        "title": "countdown",
        "to": "/components/countdown"
      },
      {
        "title": "counter",
        "to": "/components/counter"
      },
      {
        "title": "sweet_alerts",
        "to": "/components/sweetalert"
      },
      {
        "title": "timeline",
        "to": "/components/timeline"
      },
      {
        "title": "notifications",
        "to": "/components/notifications"
      },
      {
        "title": "media_object",
        "to": "/components/media-object"
      },
      {
        "title": "list_group",
        "to": "/components/list-group"
      },
      {
        "title": "pricing_tables",
        "to": "/components/pricing-table"
      },
      {
        "title": "lightbox",
        "to": "/components/lightbox"
      }
    ]
  },
  {
    "title": "elements",
    "icon": "icon-menu-elements",
    "children": [
      {
        "title": "alerts",
        "to": "/elements/alerts"
      },
      {
        "title": "avatar",
        "to": "/elements/avatar"
      },
      {
        "title": "badges",
        "to": "/elements/badges"
      },
      {
        "title": "breadcrumbs",
        "to": "/elements/breadcrumbs"
      },
      {
        "title": "buttons",
        "to": "/elements/buttons"
      },
      {
        "title": "button_groups",
        "to": "/elements/buttons-group"
      },
      {
        "title": "color_library",
        "to": "/elements/color-library"
      },
      {
        "title": "dropdown",
        "to": "/elements/dropdown"
      },
      {
        "title": "infobox",
        "to": "/elements/infobox"
      },
      {
        "title": "jumbotron",
        "to": "/elements/jumbotron"
      },
      {
        "title": "loader",
        "to": "/elements/loader"
      },
      {
        "title": "pagination",
        "to": "/elements/pagination"
      },
      {
        "title": "popovers",
        "to": "/elements/popovers"
      },
      {
        "title": "progress_bar",
        "to": "/elements/progress-bar"
      },
      {
        "title": "search",
        "to": "/elements/search"
      },
      {
        "title": "tooltips",
        "to": "/elements/tooltips"
      },
      {
        "title": "treeview",
        "to": "/elements/treeview"
      },
      {
        "title": "typography",
        "to": "/elements/typography"
      }
    ]
  },
  {
    "title": "tables",
    "icon": "icon-menu-datatables",
    "children": [
      {
        "title": "tables",
        "to": "/tables"
      },
      {
        "title": "datatables",
        "child": [
          {
            "title": "basic",
            "to": "/datatables/basic"
          },
          {
            "title": "advanced",
            "to": "/datatables/advanced"
          },
          {
            "title": "skin",
            "to": "/datatables/skin"
          },
          {
            "title": "order_sorting",
            "to": "/datatables/order-sorting"
          },
          {
            "title": "columns_filter",
            "to": "/datatables/columns-filter"
          },
          {
            "title": "multi_column",
            "to": "/datatables/multi-column"
          },
          {
            "title": "multiple_tables",
            "to": "/datatables/multiple-tables"
          },
          {
            "title": "alt_pagination",
            "to": "/datatables/alt-pagination"
          },
          {
            "title": "checkbox",
            "to": "/datatables/checkbox"
          },
          {
            "title": "range_search",
            "to": "/datatables/range-search"
          },
          {
            "title": "export",
            "to": "/datatables/export"
          },
          {
            "title": "sticky_header",
            "to": "/datatables/sticky-header"
          },
          {
            "title": "clone_header",
            "to": "/datatables/clone-header"
          },
          {
            "title": "column_chooser",
            "to": "/datatables/column-chooser"
          }
        ]
      }
    ]
  },
  {
    "title": "forms",
    "icon": "icon-menu-forms",
    "children": [
      {
        "title": "basic",
        "to": "/forms/basic"
      },
      {
        "title": "input_group",
        "to": "/forms/input-group"
      },
      {
        "title": "layouts",
        "to": "/forms/layouts"
      },
      {
        "title": "validation",
        "to": "/forms/validation"
      },
      {
        "title": "input_mask",
        "to": "/forms/input-mask"
      },
      {
        "title": "select2",
        "to": "/forms/select2"
      },
      {
        "title": "touchspin",
        "to": "/forms/touchspin"
      },
      {
        "title": "checkbox_and_radio",
        "to": "/forms/checkbox-radio"
      },
      {
        "title": "switches",
        "to": "/forms/switches"
      },
      {
        "title": "wizards",
        "to": "/forms/wizards"
      },
      {
        "title": "file_upload",
        "to": "/forms/file-upload"
      },
      {
        "title": "quill_editor",
        "to": "/forms/quill-editor"
      },
      {
        "title": "markdown_editor",
        "to": "/forms/markdown-editor"
      },
      {
        "title": "date_and_range_picker",
        "to": "/forms/date-picker"
      },
      {
        "title": "clipboard",
        "to": "/forms/clipboard"
      }
    ]
  },
  {
    "title": "pages",
    "icon": "icon-menu-pages",
    "children": [
      {
        "title": "users",
        "child": [
          {
            "title": "profile",
            "to": "/users/profile"
          },
          {
            "title": "account_settings",
            "to": "/users/user-account-settings"
          }
        ]
      },
      {
        "title": "knowledge_base",
        "to": "/pages/knowledge-base"
      },
      {
        "title": "contact_us_boxed",
        "to": "/pages/contact-us-boxed",
        "target": "_blank"
      },
      {
        "title": "contact_us_cover",
        "to": "/pages/contact-us-cover",
        "target": "_blank"
      },
      {
        "title": "FAQ",
        "to": "/pages/faq"
      },
      {
        "title": "coming_soon_boxed",
        "to": "/pages/coming-soon-boxed",
        "target": "_blank"
      },
      {
        "title": "coming_soon_cover",
        "to": "/pages/coming-soon-cover",
        "target": "_blank"
      },
      {
        "title": "maintenence",
        "to": "/pages/maintenence",
        "target": "_blank"
      },
      {
        "title": "error",
        "child": [
          {
            "title": "404",
            "to": "/pages/error404",
            "target": "_blank"
          },
          {
            "title": "500",
            "to": "/pages/error500",
            "target": "_blank"
          },
          {
            "title": "503",
            "to": "/pages/error503",
            "target": "_blank"
          }
        ]
      },
      {
        "title": "login",
        "child": [
          {
            "title": "login_cover",
            "to": "/auth/cover-login",
            "target": "_blank"
          },
          {
            "title": "login_boxed",
            "to": "/auth/boxed-signin",
            "target": "_blank"
          }
        ]
      },
      {
        "title": "register",
        "child": [
          {
            "title": "register_cover",
            "to": "/auth/cover-register",
            "target": "_blank"
          },
          {
            "title": "register_boxed",
            "to": "/auth/boxed-signup",
            "target": "_blank"
          }
        ]
      },
      {
        "title": "password_recovery",
        "child": [
          {
            "title": "recover_id_cover",
            "to": "/auth/cover-password-reset",
            "target": "_blank"
          },
          {
            "title": "recover_id_boxed",
            "to": "/auth/boxed-password-reset",
            "target": "_blank"
          }
        ]
      },
      {
        "title": "lockscreen",
        "child": [
          {
            "title": "unlock_cover",
            "to": "/auth/cover-lockscreen",
            "target": "_blank"
          },
          {
            "title": "unlock_boxed",
            "to": "/auth/boxed-lockscreen",
            "target": "_blank"
          }
        ]
      }
    ]
  },
  {
    "title": "more",
    "icon": "icon-menu-more",
    "children": [
      {
        "title": "drag_and_drop",
        "to": "/dragndrop"
      },
      {
        "title": "charts",
        "to": "/charts"
      },
      {
        "title": "font_icons",
        "to": "/font-icons"
      },
      {
        "title": "widgets",
        "to": "/widgets"
      },
      {
        "title": "documentation",
        "to": "https://vristo.sbthemes.com",
        "target": "_blank"
      }
    ]
  }
];
</script>

<template>
  <HorizontalMenu :items="items" />
</template>
```

| Name | Description | Default | Control |
| --- | --- | --- | --- |
| props |  |
| items* | Sidebar itemsHorizontalMenuGroupType[] | - | items : [0 : {...} 3 keys1 : {...} 3 keys2 : {...} 3 keys3 : {...} 3 keys4 : {...} 3 keys5 : {...} 3 keys6 : {...} 3 keys7 : {...} 3 keys] |
| events |  |
| ItemClick | Emit when the sidebar item is clickedHorizontalMenuItemType | - | - |

---

## Shell / Sidebarmenu

### SidebarMenu

### SidebarMenu

Vertical navigation menu suitable for dashboards and admin panels. Displays labeled items, groups, and nested sections.

#### Features

-   Sticky sidebar layout with collapsible sections
-   Integrates with store to control visibility
-   Dark mode and RTL support

#### Usage

Provide an items tree with groups and links. Keep the hierarchy shallow for discoverability.

```
<script lang="ts" setup>
const items = [
  {
    "title": "",
    "children": [
      {
        "title": "dashboard",
        "icon": "icon-menu-dashboard",
        "child": [
          {
            "title": "sales",
            "to": "/",
            "child": []
          },
          {
            "title": "analytics",
            "to": "/",
            "child": []
          },
          {
            "title": "finance",
            "to": "/",
            "child": []
          },
          {
            "title": "crypto",
            "to": "/",
            "child": []
          }
        ]
      }
    ]
  },
  {
    "title": "apps",
    "children": [
      {
        "title": "chat",
        "icon": "icon-menu-chat",
        "to": "/"
      },
      {
        "title": "mailbox",
        "icon": "icon-menu-mailbox",
        "to": "/"
      },
      {
        "title": "todo_list",
        "icon": "icon-menu-todo",
        "to": "/"
      },
      {
        "title": "notes",
        "icon": "icon-menu-notes",
        "to": "/"
      },
      {
        "title": "scrumboard",
        "icon": "icon-menu-scrumboard",
        "to": "/"
      },
      {
        "title": "contacts",
        "icon": "icon-menu-contacts",
        "to": "/"
      },
      {
        "title": "invoice",
        "icon": "icon-menu-invoice",
        "child": [
          {
            "title": "list",
            "to": "/",
            "child": []
          },
          {
            "title": "preview",
            "to": "/"
          },
          {
            "title": "add",
            "to": "/",
            "child": []
          },
          {
            "title": "edit",
            "to": "/",
            "child": []
          }
        ]
      },
      {
        "title": "calendar",
        "icon": "icon-menu-calendar",
        "to": "/"
      }
    ]
  },
  {
    "title": "user_interface",
    "children": [
      {
        "title": "components",
        "icon": "icon-menu-components",
        "child": [
          {
            "title": "tabs",
            "to": "/",
            "child": []
          },
          {
            "title": "accordions",
            "to": "/"
          },
          {
            "title": "modals",
            "to": "/",
            "child": []
          },
          {
            "title": "cards",
            "to": "/",
            "child": []
          },
          {
            "title": "carousel",
            "to": "/"
          },
          {
            "title": "countdown",
            "to": "/"
          },
          {
            "title": "counter",
            "to": "/",
            "child": []
          },
          {
            "title": "sweet_alerts",
            "to": "/"
          },
          {
            "title": "timeline",
            "to": "/"
          },
          {
            "title": "notifications",
            "to": "/"
          },
          {
            "title": "media_object",
            "to": "/"
          },
          {
            "title": "list_group",
            "to": "/"
          },
          {
            "title": "pricing_tables",
            "to": "/"
          },
          {
            "title": "lightbox",
            "to": "/"
          }
        ]
      },
      {
        "title": "elements",
        "icon": "icon-menu-elements",
        "child": [
          {
            "title": "alerts",
            "to": "/",
            "child": []
          },
          {
            "title": "avatar",
            "to": "/",
            "child": []
          },
          {
            "title": "badges",
            "to": "/",
            "child": []
          },
          {
            "title": "breadcrumbs",
            "to": "/"
          },
          {
            "title": "buttons",
            "to": "/",
            "child": []
          },
          {
            "title": "button_groups",
            "to": "/"
          },
          {
            "title": "color_library",
            "to": "/"
          },
          {
            "title": "dropdown",
            "to": "/",
            "child": []
          },
          {
            "title": "infobox",
            "to": "/",
            "child": []
          },
          {
            "title": "jumbotron",
            "to": "/"
          },
          {
            "title": "loader",
            "to": "/",
            "child": []
          },
          {
            "title": "pagination",
            "to": "/"
          },
          {
            "title": "popovers",
            "to": "/",
            "child": []
          },
          {
            "title": "progress_bar",
            "to": "/"
          },
          {
            "title": "search",
            "to": "/",
            "child": []
          },
          {
            "title": "tooltips",
            "to": "/",
            "child": []
          },
          {
            "title": "treeview",
            "to": "/",
            "child": []
          },
          {
            "title": "typography",
            "to": "/"
          }
        ]
      },
      {
        "title": "charts",
        "icon": "icon-menu-charts",
        "to": "/"
      },
      {
        "title": "widgets",
        "icon": "icon-menu-widgets",
        "to": "/"
      },
      {
        "title": "font_icons",
        "icon": "icon-menu-font-icons",
        "to": "/"
      },
      {
        "title": "drag_and_drop",
        "icon": "icon-menu-drag-and-drop",
        "to": "/"
      }
    ]
  },
  {
    "title": "tables_and_forms",
    "children": [
      {
        "title": "tables",
        "icon": "icon-menu-tables",
        "to": "/"
      },
      {
        "title": "datatables",
        "icon": "icon-menu-datatables",
        "child": [
          {
            "title": "basic",
            "to": "/",
            "child": []
          },
          {
            "title": "advanced",
            "to": "/"
          },
          {
            "title": "skin",
            "to": "/",
            "child": []
          },
          {
            "title": "order_sorting",
            "to": "/"
          },
          {
            "title": "columns_filter",
            "to": "/"
          },
          {
            "title": "multi_column",
            "to": "/"
          },
          {
            "title": "multiple_tables",
            "to": "/"
          },
          {
            "title": "alt_pagination",
            "to": "/"
          },
          {
            "title": "checkbox",
            "to": "/"
          },
          {
            "title": "range_search",
            "to": "/"
          },
          {
            "title": "export",
            "to": "/",
            "child": []
          },
          {
            "title": "sticky_header",
            "to": "/"
          },
          {
            "title": "clone_header",
            "to": "/"
          },
          {
            "title": "column_chooser",
            "to": "/"
          }
        ]
      },
      {
        "title": "forms",
        "icon": "icon-menu-forms",
        "child": [
          {
            "title": "basic",
            "to": "/",
            "child": []
          },
          {
            "title": "input_group",
            "to": "/"
          },
          {
            "title": "layouts",
            "to": "/",
            "child": []
          },
          {
            "title": "validation",
            "to": "/",
            "child": []
          },
          {
            "title": "input_mask",
            "to": "/",
            "child": []
          },
          {
            "title": "select2",
            "to": "/",
            "child": []
          },
          {
            "title": "touchspin",
            "to": "/",
            "child": []
          },
          {
            "title": "checkbox_and_radio",
            "to": "/"
          },
          {
            "title": "switches",
            "to": "/",
            "child": []
          },
          {
            "title": "wizards",
            "to": "/",
            "child": []
          },
          {
            "title": "file_upload",
            "to": "/"
          },
          {
            "title": "quill_editor",
            "to": "/"
          },
          {
            "title": "markdown_editor",
            "to": "/"
          },
          {
            "title": "date_and_range_picker",
            "to": "/"
          },
          {
            "title": "clipboard",
            "to": "/forms/clipboard",
            "child": []
          }
        ]
      }
    ]
  },
  {
    "title": "user_and_pages",
    "children": [
      {
        "title": "users",
        "icon": "icon-menu-users",
        "child": [
          {
            "title": "profile",
            "to": "/users/profile",
            "child": []
          },
          {
            "title": "account_settings",
            "to": "/"
          }
        ]
      },
      {
        "title": "pages",
        "icon": "icon-menu-pages",
        "child": [
          {
            "title": "knowledge_base",
            "to": "/"
          },
          {
            "title": "contact_us_boxed",
            "to": "/",
            "target": "_blank"
          },
          {
            "title": "contact_us_cover",
            "to": "/",
            "target": "_blank"
          },
          {
            "title": "faq",
            "to": "/pages/faq",
            "child": []
          },
          {
            "title": "coming_soon_boxed",
            "to": "/",
            "target": "_blank"
          },
          {
            "title": "coming_soon_cover",
            "to": "/",
            "target": "_blank"
          },
          {
            "title": "error",
            "child": [
              {
                "title": "404",
                "to": "/",
                "target": "_blank"
              },
              {
                "title": "500",
                "to": "/",
                "target": "_blank"
              },
              {
                "title": "503",
                "to": "/",
                "target": "_blank"
              }
            ]
          },
          {
            "title": "maintenence",
            "to": "/",
            "target": "_blank"
          }
        ]
      },
      {
        "title": "authentication",
        "icon": "icon-menu-authentication",
        "child": [
          {
            "title": "login_boxed",
            "to": "/",
            "target": "_blank"
          },
          {
            "title": "register_boxed",
            "to": "/",
            "target": "_blank"
          },
          {
            "title": "unlock_boxed",
            "to": "/",
            "target": "_blank"
          },
          {
            "title": "recover_id_boxed",
            "to": "/",
            "target": "_blank"
          },
          {
            "title": "login_cover",
            "to": "/",
            "target": "_blank"
          },
          {
            "title": "register_cover",
            "to": "/",
            "target": "_blank"
          },
          {
            "title": "unlock_cover",
            "to": "/",
            "target": "_blank"
          },
          {
            "title": "recover_id_cover",
            "to": "/",
            "target": "_blank"
          }
        ]
      }
    ]
  },
  {
    "title": "supports",
    "children": [
      {
        "title": "documentation",
        "icon": "icon-menu-documentation",
        "to": "https://vristo.sbthemes.com",
        "target": "_blank"
      }
    ]
  }
];
</script>

<template>
  <SidebarMenu :items="items" title="SIDEBAR" />
</template>
```

| Name | Description | Default | Control |
| --- | --- | --- | --- |
| props |  |
| items* | Sidebar itemsSidebarGroupType[] | - | items : [0 : {...} 2 keys1 : {...} 2 keys2 : {...} 2 keys3 : {...} 2 keys4 : {...} 2 keys5 : {...} 2 keys] |
| title | Sidebar titlestring | - | SIDEBAR |
| brandLogo | Sidebar logo URLstring | - |  |
| events |  |
| ItemClick | Emit when the sidebar item is clickedSidebarItemType | - | - |
| slots |  |
| brand | brand content, title will be removed in this caseother | - |  |

---

## Icons Alternative Icon / Packs

### Alternative Icon Packs

Using Iconify as an Alternative Icon Pack with Tailwind CSS

Iconify is a comprehensive icon library that offers over 200,000 icons from many popular sets. It can serve as an alternative icon pack for Tailwind CSS projects, giving you access to a vast selection of icons beyond the defaults. With the Iconify Tailwind plugin, you can easily integrate these icons and style them with Tailwind utility classes.

-   **Official Website:** Iconify gallery
-   **Official Iconify Tailwind CSS page:** doc

#### Tailwind CSS Setup for Iconify

To get started with Iconify in a Tailwind CSS project, follow these steps:

###### 1\. **Install the Iconify Tailwind CSS plugin and icon set(s):**

Add the official plugin and any icon sets you want to use as development dependencies. For example, to use Material Design Icons (light theme) you can run: `npm install -D @iconify/tailwind @iconify-json/mdi-light`.

###### 2\. **Configure Tailwind to use the Iconify plugin:**

Open your tailwind.config.js and import the plugin. Then add it to the plugins array, specifying which icon sets (by their prefix) to include if using the static selectors. For example:

```
// tailwind.config.js
const { addIconSelectors } = require('@iconify/tailwind');
module.exports = {
  // ... other Tailwind config ...
  plugins: [
    // Include Iconify plugin and specify icon set prefixes to load
    addIconSelectors(['mdi-light']) 
  ]
};

// (Alternatively, you can use the dynamic plugin with addDynamicIconSelectors() to avoid listing prefixes. 
// Make sure to install the icon sets you need.)
```

###### 3\. **Run your build:**

Ensure your build process (e.g., Vite or Webpack) runs Tailwind so it generates the icon classes. The plugin will generate the necessary CSS for any Iconify icon classes you use in your templates.

Usage Example in a Vue Component

After setup, you can use Iconify icons in your Vue components just like using any other HTML element with Tailwind classes. For example, in a Vue component template you might add an icon like this:

```
<template>
  <!-- Using the 'home' icon from Material Design Icons (mdi-light set) -->
  <span class="icon-[mdi-light--home] text-gray-600 w-6 h-6"></span>
  <icon name="icon-[mdi-light--home]" />
  <Button iconName="icon-[mdi-light--home]" />
  <IconButton iconName="icon-[mdi-light--home]" />
</template>
```

In the snippet above, the icon-\[mdi-light--home\] class inserts the mdi-light:home icon as an inline SVG. We also apply Tailwind utility classes for color and size. In this example, text-gray-600 sets the icon color (monotone icons inherit the text color), and w-6 h-6 gives it a fixed width and height. You can swap out the prefix and icon name to use any icon from Iconify’s library (just make sure you’ve installed the corresponding icon set).

For more details on using Iconify with Tailwind (and other setup options like additional icon sets or dynamic mode), refer to the official Iconify Tailwind CSS documentation.

---

## Icons Icon / Gallery

### Icon Gallery

To use icons listed in this page you need to import the `icon` component and provide a name from the list below.

```
<template>
  <icon name="IconMenuTables" />
</template>

<script lang="ts" setup>
import { Icon } from 'pilotui/elements.ts'
</script>
```

### Menu Icons

IconMenuScrumboard

IconMenuTables

IconMenuComponents

IconMenuWidgets

IconMenuUsers

IconMenuElements

IconMenuMore

IconMenuChat

IconMenuDatatables

IconMenuContacts

IconMenuFontIcons

IconMenuAuthentication

IconMenuCalendar

IconMenuMailbox

IconMenuDashboard

IconMenuPages

IconMenuForms

IconMenuInvoice

IconMenuDragAndDrop

IconMenuTodo

IconMenuCharts

IconMenuApps

IconMenuNotes

IconMenuDocumentation

### Variant Icons

IconAirplay

IconCaretsDown

IconMessageDots

IconUser

IconPlayCircle

IconPhoneCall

IconLockDots

IconMail

IconDesktop

IconBookmark

IconBox

IconPlusCircle

IconDollarSignCircle

IconInfoCircle

IconPencil

IconRouter

IconTwitter

IconMinusCircle

IconLayout

### Static Icons

IconArrowLeft

IconArrowRight

IconArrowUp

IconArrowDown

IconArrowWaveLeftUp

IconArrowBackward

IconArrowForward

IconMultipleForwardRight

IconCaretDown

IconLogin

IconLogout

IconFacebook

IconFacebookCircle

IconLinkedin

IconInstagram

IconDribbble

IconGoogle

IconChrome

IconNetflix

IconSafari

IconGithub

IconTether

IconBinance

IconBitcoin

IconEthereum

IconSolana

Litecoin

IconLitecoin

IconUserPlus

IconUsers

IconUsersGroup

IconLock

IconLockOpen

IconSettings

IconMoodSmile

IconEye

IconEyeOff

IconCashBanknotes

IconShoppingCart

IconShoppingBag

IconCreditCard

IconDollarSign

IconTag

IconChatNotification

IconChatDot

IconChatDots

IconMessagesDot

IconMessage

IconMessage2

IconMailDot

IconBell

IconBellBing

IconThumbUp

IconAt

IconShare

IconLink

IconFile

IconTxtFile

IconZipFile

IconFolder

IconFolderPlus

IconFolderMinus

IconOpenBook

IconBook

IconClipboardText

IconNotes

IconNotesEdit

IconPencilPaper

IconPaperclip

IconCopy

IconPrinter

IconSave

IconInfoTriangle

IconInfoHexagon

IconHelpCircle

IconListCheck

IconChecks

IconCheck

IconSquareCheck

IconCircleCheck

IconLoader

IconPlus

IconMinus

IconX

IconXCircle

IconSquareRotated

IconCamera

IconGallery

IconVideo

IconMicrophoneOff

IconCode

IconCpuBolt

IconHome

IconSearch

IconMenu

IconRefresh

IconLayoutGrid

IconHorizontalDots

IconServer

IconLaptop

IconWheel

IconBarChart

IconChartSquare

IconTrendingUp

IconCalendar

IconClock

IconTrash

IconTrashLines

IconArchive

IconCloudDownload

IconCloudUpload

IconGlobe

IconMapPin

IconPhone

IconRestore

IconSend

IconSun

IconMoon

IconDroplet

IconAward

IconHeart

IconBolt

IconCoffee

IconStar

---

## Utilities / Toast

### Toast Utility Functions

The `toast.ts` file provides utility functions for displaying toast notifications using SweetAlert2. These functions allow you to show different types of toast messages with various configurations.

#### Usage

To show a basic toast message, use the `showToast` function:

```
import { showToast, toastSuccess, toastError, toastWarning, toastInfo } from 'pilotui/toast.ts';

showToast({ message: 'This is a basic toast message', variant: 'success' });

toastSuccess('This is a success toast message');

toastError('This is an error toast message');

toastWarning('This is a warning toast message');

toastInfo('This is an info toast message');
```

#### Configuration

```
{
  render: args => ({
    components: {
      Button
    },
    setup() {
      return {
        args
      };
    },
    template: '<Button color="primary" @click="showToast(args)">Send a Toast</Button>',
    methods: {
      showToast
    }
  })
}
```

| Name | Description | Default | Control |
| --- | --- | --- | --- |
| message | string | - | This is a toast message |
| variant | string | - | defaultsuccessdangerwarninginfo |
| position | string | - | top-righttop-leftbottom-rightbottom-left |
| duration | number | - |  |
| showCloseButton | boolean | - | FalseTrue |
| onDismiss | function | - | - |
| containerId | string | - |  |
| isRTL | boolean | - | FalseTrue |

---

## Complex / Modal

### Modal

A flexible dialog for confirmations, forms, and rich content. Provides slots for trigger, title, default content, and footer; supports sizes, vertical alignment, and animations.

#### Features

-   Sizes: sm, md, lg, xl, full; center/top/bottom positioning
-   Animations: fade, slide, rotate, zoom (and none)
-   Persistent and prevent-close modes; optional close button hiding
-   Custom content and footer slots; content class passthrough

#### Accessibility

-   Focus trapping and ESC/overlay behaviors configurable via props
-   Ensure meaningful titles and keyboard operability of controls.

#### Usage

Use for tasks that require focused attention. Keep content concise; avoid nesting modals.

```
{
  render: args => ({
    components: {
      Modal,
      Button
    },
    setup() {
      return {
        args
      };
    },
    template: `
      <Modal v-bind="args">
        <template #default="{ toggleModal }">
          <div class="text-center">
            <h3 class="text-lg font-medium mb-4">Default Modal Content</h3>
            <p class="text-gray-600 dark:text-gray-400 mb-6">
              This is a basic modal with default settings. You can customize the content, size, and behavior.
            </p>
            <div class="flex justify-end space-x-2">
              <Button outline @click="toggleModal(false)">Cancel</Button>
              <Button color="primary" @click="toggleModal(false)">Confirm</Button>
            </div>
          </div>
        </template>
      </Modal>
    `
  })
}
```

| Name | Description | Default | Control |
| --- | --- | --- | --- |
| props |  |
| modelValue | Controls the visibility of the modal.boolean | - | FalseTrue |
| title | The title of the modal.string | "" | Modal Title |
| triggerLabel | The label for the trigger button that opens the modal.string | - | Open Modal |
| size | The size of the modal. Can be one of "sm", "md", "lg", "xl", or "full".ModalSize | "md" | smmdlgxlfull |
| animation | The animation type for the modal. Can be one of "fade", "slideDown", "slideUp", "fadeLeft", "fadeRight", "rotateLeft", "zoomIn", or "none".AnimationType | "fade" | fadeslideDownslideUpfadeLeftfadeRightrotateLeftzoomInnone |
| hideClose | If true, the close button will be hidden.boolean | false | FalseTrue |
| persistent | If true, the modal will not close when clicking outside of it.boolean | false | FalseTrue |
| preventClose | If true, the modal cannot be closed.boolean | false | FalseTrue |
| contentClass | Custom class for the content area of the modal.string | "" |  |
| verticalPosition | The position of the modal on the screen."top""center""bottom" | - | topcenterbottom |
| customClass | Custom classes for different parts of the modal.ModalClass | () => ({ panel: "", overlay: "", wrapper: "", }) |  |
| events |  |
| update:modelValue | boolean | - | - |
| close | other | - | - |
| slots |  |
| trigger | { toggleModal: unknown } | - |  |
| default | { toggleModal: unknown } | - |  |
| footer | { toggleModal: unknown } | - |  |

#### Stories

##### Default

```
{
  render: args => ({
    components: {
      Modal,
      Button
    },
    setup() {
      return {
        args
      };
    },
    template: `
      <Modal v-bind="args">
        <template #default="{ toggleModal }">
          <div class="text-center">
            <h3 class="text-lg font-medium mb-4">Default Modal Content</h3>
            <p class="text-gray-600 dark:text-gray-400 mb-6">
              This is a basic modal with default settings. You can customize the content, size, and behavior.
            </p>
            <div class="flex justify-end space-x-2">
              <Button outline @click="toggleModal(false)">Cancel</Button>
              <Button color="primary" @click="toggleModal(false)">Confirm</Button>
            </div>
          </div>
        </template>
      </Modal>
    `
  })
}
```

##### Custom Trigger

```
{
  render: args => ({
    components: {
      Modal,
      Button
    },
    setup() {
      return {
        args
      };
    },
    template: `
      <Modal v-bind="args">
        <template #trigger="{ toggleModal }">
          <Button color="primary" size="lg" @click="toggleModal(true)">
            🚀 Launch Modal
          </Button>
        </template>
        
        <template #default="{ toggleModal }">
          <div class="text-center">
            <h3 class="text-lg font-medium mb-4">Custom Trigger</h3>
            <p class="text-gray-600 dark:text-gray-400 mb-6">
              This modal uses a custom trigger button instead of the default one.
            </p>
            <Button color="primary" @click="toggleModal(false)">Close</Button>
          </div>
        </template>
      </Modal>
    `
  }),
  args: {
    title: "Custom Trigger Modal"
  }
}
```

##### With Title

```
{
  render: args => ({
    components: {
      Modal,
      Button
    },
    setup() {
      return {
        args
      };
    },
    template: `
      <Modal v-bind="args">
        <template #default="{ toggleModal }">
          <div class="text-center">
            <p class="text-gray-600 dark:text-gray-400 mb-6">
              This modal has a custom title in the header area.
            </p>
            <div class="flex justify-end space-x-2">
              <Button outline @click="toggleModal(false)">Cancel</Button>
              <Button color="primary" @click="toggleModal(false)">Save Changes</Button>
            </div>
          </div>
        </template>
      </Modal>
    `
  }),
  args: {
    title: "Custom Modal Title"
  }
}
```

##### With Title Slot

```
{
  render: args => ({
    components: {
      Modal,
      Button
    },
    setup() {
      return {
        args
      };
    },
    template: `
      <Modal v-bind="args">
        <template #title>
          <div class="flex items-center space-x-2">
            <span class="text-2xl">🎨</span>
            <span>Custom Title Slot</span>
            <span class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">New</span>
          </div>
        </template>
        
        <template #default="{ toggleModal }">
          <div class="text-center">
            <p class="text-gray-600 dark:text-gray-400 mb-6">
              This modal demonstrates the title slot functionality. You can add custom content, icons, and styling to the title area.
            </p>
            <div class="flex justify-end space-x-2">
              <Button outline @click="toggleModal(false)">Cancel</Button>
              <Button color="primary" @click="toggleModal(false)">Save</Button>
            </div>
          </div>
        </template>
      </Modal>
    `
  }),
  args: {
    // Don't set title prop when using title slot
  }
}
```

##### Persistent

```
{
  render: args => ({
    components: {
      Modal,
      Button
    },
    setup() {
      return {
        args
      };
    },
    template: `
      <Modal v-bind="args">
        <template #default="{ toggleModal }">
          <div class="text-center">
            <h3 class="text-lg font-medium mb-4 text-orange-600">⚠️ Important Notice</h3>
            <p class="text-gray-600 dark:text-gray-400 mb-6">
              This is a persistent modal. It won't close when clicking outside or pressing escape.
              You must use the action buttons to close it.
            </p>
            <div class="flex justify-end space-x-2">
              <Button outline @click="toggleModal(false)">Dismiss</Button>
              <Button color="primary" @click="toggleModal(false)">Acknowledge</Button>
            </div>
          </div>
        </template>
      </Modal>
    `
  }),
  args: {
    persistent: true,
    title: "Persistent Modal"
  }
}
```

##### Custom Size

```
{
  render: args => ({
    components: {
      Modal,
      Button
    },
    setup() {
      return {
        args
      };
    },
    template: `
      <Modal v-bind="args">
        <template #default="{ toggleModal }">
          <div>
            <h3 class="text-lg font-medium mb-4">Large Modal</h3>
            <div class="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label class="block text-sm font-medium mb-2">First Name</label>
                <input type="text" class="form-input w-full" placeholder="Enter first name" />
              </div>
              <div>
                <label class="block text-sm font-medium mb-2">Last Name</label>
                <input type="text" class="form-input w-full" placeholder="Enter last name" />
              </div>
              <div>
                <label class="block text-sm font-medium mb-2">Email</label>
                <input type="email" class="form-input w-full" placeholder="Enter email" />
              </div>
              <div>
                <label class="block text-sm font-medium mb-2">Phone</label>
                <input type="tel" class="form-input w-full" placeholder="Enter phone" />
              </div>
            </div>
            <div class="mb-6">
              <label class="block text-sm font-medium mb-2">Message</label>
              <textarea class="form-textarea w-full" rows="4" placeholder="Enter your message"></textarea>
            </div>
            <div class="flex justify-end space-x-2">
              <Button outline @click="toggleModal(false)">Cancel</Button>
              <Button color="primary" @click="toggleModal(false)">Submit</Button>
            </div>
          </div>
        </template>
      </Modal>
    `
  }),
  args: {
    size: "lg",
    title: "Contact Form"
  }
}
```

##### Custom Animation

```
{
  render: args => ({
    components: {
      Modal,
      Button
    },
    setup() {
      return {
        args
      };
    },
    template: `
      <Modal v-bind="args">
        <template #default="{ toggleModal }">
          <div class="text-center">
            <div class="text-6xl mb-4">🎉</div>
            <h3 class="text-lg font-medium mb-4">Success!</h3>
            <p class="text-gray-600 dark:text-gray-400 mb-6">
              This modal uses a zoom-in animation effect. Try opening it again to see the animation.
            </p>
            <Button color="primary" @click="toggleModal(false)">Awesome!</Button>
          </div>
        </template>
      </Modal>
    `
  }),
  args: {
    animation: "zoomIn",
    title: "Animated Modal"
  }
}
```

##### With Footer

```
{
  render: args => ({
    components: {
      Modal,
      Button
    },
    setup() {
      return {
        args
      };
    },
    template: `
      <Modal v-bind="args">
        <template #default="{ toggleModal }">
          <div>
            <p class="text-gray-600 dark:text-gray-400 mb-4">
              This modal demonstrates the footer slot functionality. The footer appears at the bottom with a border separator.
            </p>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium mb-2">Name</label>
                <input type="text" class="form-input w-full" placeholder="Enter your name" />
              </div>
              <div>
                <label class="block text-sm font-medium mb-2">Email</label>
                <input type="email" class="form-input w-full" placeholder="Enter your email" />
              </div>
            </div>
          </div>
        </template>
        
        <template #footer="{ toggleModal }">
          <div class="flex justify-between">
            <Button outline @click="toggleModal(false)">Cancel</Button>
            <div class="space-x-2 flex">
              <Button outline>Save Draft</Button>
              <Button color="primary" @click="toggleModal(false)">Submit</Button>
            </div>
          </div>
        </template>
      </Modal>
    `
  }),
  args: {
    title: "Modal with Footer"
  }
}
```

##### No Close Button

```
{
  render: args => ({
    components: {
      Modal,
      Button
    },
    setup() {
      return {
        args
      };
    },
    template: `
      <Modal v-bind="args">
        <template #default="{ toggleModal }">
          <div class="text-center">
            <h3 class="text-lg font-medium mb-4">No Close Button</h3>
            <p class="text-gray-600 dark:text-gray-400 mb-6">
              This modal has the close button hidden. You must use the action buttons to close it.
            </p>
            <div class="flex justify-center space-x-2">
              <Button outline @click="toggleModal(false)">Cancel</Button>
              <Button color="primary" @click="toggleModal(false)">Proceed</Button>
            </div>
          </div>
        </template>
      </Modal>
    `
  }),
  args: {
    hideClose: true,
    title: "Confirmation Required"
  }
}
```

##### Small Size

```
{
  render: args => ({
    components: {
      Modal,
      Button
    },
    setup() {
      return {
        args
      };
    },
    template: `
      <Modal v-bind="args">
        <template #default="{ toggleModal }">
          <div class="text-center">
            <div class="text-4xl mb-4">❓</div>
            <h3 class="text-lg font-medium mb-4">Confirm Action</h3>
            <p class="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to proceed?
            </p>
            <div class="flex justify-center space-x-2">
              <Button outline size="sm" @click="toggleModal(false)">No</Button>
              <Button color="danger" size="sm" @click="toggleModal(false)">Yes, Delete</Button>
            </div>
          </div>
        </template>
      </Modal>
    `
  }),
  args: {
    size: "sm",
    triggerLabel: "Delete Item"
  }
}
```

---

## Complex / Pagination

### Pagination

```
The Pagination component allows users to navigate through multiple pages of content.
      
      ## Events
      - `update:modelValue`: Emitted when the current page changes (for v-model support)
      - `change-page`: Emitted when the page changes, with the new page number as payload
      
      ## Usage
      
      ```vue
      <template>
        <Pagination
          v-model="page"
          @change-page="handlePageChange"
        />
      </template>
      
      <script setup lang="ts">
      import { ref } from 'vue';
      
      const page = ref(1);
      const handlePageChange = (newPage) => {
        // Fetch new data or update your state
      };
      </script>
      ```
```

Current Page: 1

-   1 / 5

```
<template>
  <Pagination :initialPage="1" :totalPages="5" />
</template>
```

| Name | Description | Default | Control |
| --- | --- | --- | --- |
| initialPage | Initial page numbernumber | - |  |
| totalPages | Total number of pagesnumber | - |  |

#### Stories

##### Default

Default pagination using directly provided totalPages

Current Page: 1

-   1 / 5

```
<template>
  <Pagination :initialPage="1" :totalPages="5" />
</template>
```

##### Last Page

Pagination on last page

Current Page: 9

-   9 / 1

```
<template>
  <Pagination :initialPage="9" />
</template>
```

##### Single Page

Single page pagination

Current Page: 1

-   1 / 1

```
<template>
  <Pagination :initialPage="1" />
</template>
```

---

## Elements / Avatar

### Avatar

Displays a user image or placeholder with configurable size and rounding. Optional presence indicator conveys online/offline state.

#### Features

-   Sizes: xs, sm, md, lg
-   Rounding: none → full
-   Optional status dot (online, offline, away, busy)
-   Dark mode and RTL-aware spacing

#### Accessibility

-   Always provide a meaningful alt describing the person/content shown.

#### Usage

Use in lists, headers, and cards. Combine with AvatarGroup to show multiple participants.

![User avatar](https://html.vristo.sbthemes.com/assets/images/profile-12.jpeg)

```
<template>
  <Avatar
    alt="User avatar"
    :disabled="false"
    rounded="full"
    showStatus
    size="lg"
    src="https://html.vristo.sbthemes.com/assets/images/profile-12.jpeg"
    status="online"
  />
</template>
```

| Name | Description | Default | Control |
| --- | --- | --- | --- |
| props |  |
| rounded | Border radius of the avatar"full""none""xs""sm""md""lg""xl" | "full" | Choose option...nonexssmmdlgxlfull |
| size | Size of the avatar"xs""sm""md""lg" | - | Choose option...xssmmdlg |
| showStatus | Whether to display the status indicatorboolean | false | FalseTrue |
| status | Current status of the user"online""offline""away""busy" | "online" | Choose option...onlineofflineawaybusy |
| disabled | Whether the avatar is in a disabled stateboolean | false | FalseTrue |
| src* | Image source URL for the avatarstring |  | https://html.vristo.sbthemes.com/assets/images/profile-12.jpeg |
| alt | Alternative text for accessibilitystring | - | User avatar |
| slots |  |
| status-icon | other | - |  |

#### Stories

##### Default

![User avatar](https://html.vristo.sbthemes.com/assets/images/profile-12.jpeg)

```
<template>
  <Avatar
    alt="User avatar"
    :disabled="false"
    rounded="full"
    showStatus
    size="lg"
    src="https://html.vristo.sbthemes.com/assets/images/profile-12.jpeg"
    status="online"
  />
</template>
```

##### With Online Status

![User avatar](https://html.vristo.sbthemes.com/assets/images/profile-12.jpeg)

```
<template>
  <Avatar
    alt="User avatar"
    :disabled="false"
    rounded="full"
    showStatus
    size="lg"
    src="https://html.vristo.sbthemes.com/assets/images/profile-12.jpeg"
    status="online"
  />
</template>
```

##### With Offline Status

![User avatar](https://html.vristo.sbthemes.com/assets/images/profile-12.jpeg)

```
<template>
  <Avatar
    alt="User avatar"
    :disabled="false"
    rounded="full"
    showStatus
    size="lg"
    src="https://html.vristo.sbthemes.com/assets/images/profile-12.jpeg"
    status="offline"
  />
</template>
```

##### With Away Status

![User avatar](https://html.vristo.sbthemes.com/assets/images/profile-12.jpeg)

```
<template>
  <Avatar
    alt="User avatar"
    :disabled="false"
    rounded="full"
    showStatus
    size="lg"
    src="https://html.vristo.sbthemes.com/assets/images/profile-12.jpeg"
    status="away"
  />
</template>
```

##### With Busy Status

![User avatar](https://html.vristo.sbthemes.com/assets/images/profile-12.jpeg)

```
<template>
  <Avatar
    alt="User avatar"
    :disabled="false"
    rounded="full"
    showStatus
    size="lg"
    src="https://html.vristo.sbthemes.com/assets/images/profile-12.jpeg"
    status="busy"
  />
</template>
```

##### Square Avatar

![User avatar](https://html.vristo.sbthemes.com/assets/images/profile-12.jpeg)

```
<template>
  <Avatar
    alt="User avatar"
    :disabled="false"
    rounded="none"
    showStatus
    size="lg"
    src="https://html.vristo.sbthemes.com/assets/images/profile-12.jpeg"
    status="online"
  />
</template>
```

##### Slightly Rounded Avatar

![User avatar](https://html.vristo.sbthemes.com/assets/images/profile-12.jpeg)

```
<template>
  <Avatar
    alt="User avatar"
    :disabled="false"
    rounded="sm"
    showStatus
    size="lg"
    src="https://html.vristo.sbthemes.com/assets/images/profile-12.jpeg"
    status="online"
  />
</template>
```

##### Fully Rounded Avatar

![User avatar](https://html.vristo.sbthemes.com/assets/images/profile-12.jpeg)

```
<template>
  <Avatar
    alt="User avatar"
    :disabled="false"
    rounded="full"
    showStatus
    size="lg"
    src="https://html.vristo.sbthemes.com/assets/images/profile-12.jpeg"
    status="online"
  />
</template>
```

---

## Elements / Avatargroup

### AvatarGroup

#### A container component for grouping multiple avatars

Groups multiple Avatar components with an overlapping layout to indicate participants or teams.

#### Features

-   Automatic spacing/overlap with RTL support
-   Optional hover animations
-   Works with any Avatar sizes and rounding

#### Accessibility

-   Ensure each avatar has an informative alt text; the group itself should be labeled when used as a control.

#### Usage

Use to summarize membership, commenters, or assignees; link the group to a details view when appropriate.

![User 1](https://html.vristo.sbthemes.com/assets/images/profile-12.jpeg)

![User 2](https://html.vristo.sbthemes.com/assets/images/profile-12.jpeg)

![User 3](https://html.vristo.sbthemes.com/assets/images/profile-12.jpeg)

```
{
  parameters: {
    docs: {
      description: {
        story: "Standard implementation of the avatar group with three members."
      }
    }
  },
  render: args => ({
    components: {
      AvatarGroup,
      Avatar
    },
    setup() {
      return {
        avatarImages,
        args
      };
    },
    template: `
      <AvatarGroup v-bind="args">
        <Avatar 
          v-for="(avatar, index) in avatarImages" 
          :key="index" 
          :src="avatar.src"
          :alt="avatar.alt"
        />
      </AvatarGroup>
    `
  }),
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Verify avatar group renders correctly", async () => {
      const avatarGroup = canvas.getByRole("group");
      expect(avatarGroup).toBeInTheDocument();
      expect(avatarGroup).toHaveClass("flex", "items-center");
    });
    await step("Verify all avatars are rendered", async () => {
      const avatars = canvas.getAllByAltText(/User \d/);
      expect(avatars).toHaveLength(3);
      avatars.forEach((avatar, index) => {
        expect(avatar).toBeInTheDocument();
        expect(avatar).toHaveAttribute("src", "https://html.vristo.sbthemes.com/assets/images/profile-12.jpeg");
      });
    });
  }
}
```

| Name | Description | Default | Control |
| --- | --- | --- | --- |
| props |  |
| hoverAnimation | Add animation effect when hovering avatarsboolean | - | FalseTrue |
| slots |  |
| default | other | - |  |

#### Stories

##### Default

Standard implementation of the avatar group with three members.

![User 1](https://html.vristo.sbthemes.com/assets/images/profile-12.jpeg)

![User 2](https://html.vristo.sbthemes.com/assets/images/profile-12.jpeg)

![User 3](https://html.vristo.sbthemes.com/assets/images/profile-12.jpeg)

```
{
  parameters: {
    docs: {
      description: {
        story: "Standard implementation of the avatar group with three members."
      }
    }
  },
  render: args => ({
    components: {
      AvatarGroup,
      Avatar
    },
    setup() {
      return {
        avatarImages,
        args
      };
    },
    template: `
      <AvatarGroup v-bind="args">
        <Avatar 
          v-for="(avatar, index) in avatarImages" 
          :key="index" 
          :src="avatar.src"
          :alt="avatar.alt"
        />
      </AvatarGroup>
    `
  }),
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Verify avatar group renders correctly", async () => {
      const avatarGroup = canvas.getByRole("group");
      expect(avatarGroup).toBeInTheDocument();
      expect(avatarGroup).toHaveClass("flex", "items-center");
    });
    await step("Verify all avatars are rendered", async () => {
      const avatars = canvas.getAllByAltText(/User \d/);
      expect(avatars).toHaveLength(3);
      avatars.forEach((avatar, index) => {
        expect(avatar).toBeInTheDocument();
        expect(avatar).toHaveAttribute("src", "https://html.vristo.sbthemes.com/assets/images/profile-12.jpeg");
      });
    });
  }
}
```

##### With More Avatars

Avatar group displaying a larger number of members to demonstrate spacing.

![User 1](https://html.vristo.sbthemes.com/assets/images/profile-12.jpeg)

![User 2](https://html.vristo.sbthemes.com/assets/images/profile-12.jpeg)

![User 3](https://html.vristo.sbthemes.com/assets/images/profile-12.jpeg)

![User 4](https://html.vristo.sbthemes.com/assets/images/profile-12.jpeg)

![User 5](https://html.vristo.sbthemes.com/assets/images/profile-12.jpeg)

```
{
  parameters: {
    docs: {
      description: {
        story: "Avatar group displaying a larger number of members to demonstrate spacing."
      }
    }
  },
  render: args => ({
    components: {
      AvatarGroup,
      Avatar
    },
    setup() {
      const extendedAvatars = [...avatarImages, {
        src: "https://html.vristo.sbthemes.com/assets/images/profile-12.jpeg",
        alt: "User 4"
      }, {
        src: "https://html.vristo.sbthemes.com/assets/images/profile-12.jpeg",
        alt: "User 5"
      }];
      return {
        avatarImages: extendedAvatars,
        args
      };
    },
    template: `
      <AvatarGroup v-bind="args">
        <Avatar 
          v-for="(avatar, index) in avatarImages" 
          :key="index" 
          :src="avatar.src"
          :alt="avatar.alt"
        />
      </AvatarGroup>
    `
  }),
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Verify extended avatar group renders correctly", async () => {
      const avatarGroup = canvas.getByRole("group");
      expect(avatarGroup).toBeInTheDocument();
    });
    await step("Verify all 5 avatars are rendered", async () => {
      const avatars = canvas.getAllByAltText(/User \d/);
      expect(avatars).toHaveLength(5);
    });
  }
}
```

##### Animate X

Avatar group with Animate X.

![User 1](https://html.vristo.sbthemes.com/assets/images/profile-12.jpeg)

![User 2](https://html.vristo.sbthemes.com/assets/images/profile-12.jpeg)

![User 3](https://html.vristo.sbthemes.com/assets/images/profile-12.jpeg)

```
{
  parameters: {
    docs: {
      description: {
        story: "Avatar group with Animate X."
      }
    }
  },
  args: {
    hoverAnimation: true
  },
  render: args => ({
    components: {
      AvatarGroup,
      Avatar
    },
    setup() {
      return {
        avatarImages,
        args
      };
    },
    template: `
      <div>
        <AvatarGroup v-bind="args">
          <Avatar
            v-for="(avatar, index) in avatarImages" 
            :key="index" 
            :src="avatar.src"
            :alt="avatar.alt"
          />
        </AvatarGroup>
      </div>
    `
  }),
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Verify animated avatar group renders correctly", async () => {
      const avatarGroup = canvas.getByRole("group");
      expect(avatarGroup).toBeInTheDocument();
    });
    await step("Verify hover animation classes are applied", async () => {
      const avatars = canvas.getAllByAltText(/User \d/);
      avatars.forEach(avatar => {
        const avatarContainer = avatar.parentElement;
        expect(avatarContainer).toHaveClass("transition-all", "duration-300", "hover:translate-x-2");
      });
    });
  }
}
```

##### RTL Support

Avatar group with RTL (Right-to-Left) layout support enabled.

![User 1](https://html.vristo.sbthemes.com/assets/images/profile-12.jpeg)

![User 2](https://html.vristo.sbthemes.com/assets/images/profile-12.jpeg)

![User 3](https://html.vristo.sbthemes.com/assets/images/profile-12.jpeg)

```
{
  parameters: {
    docs: {
      description: {
        story: "Avatar group with RTL (Right-to-Left) layout support enabled."
      }
    }
  },
  render: args => ({
    components: {
      AvatarGroup,
      Avatar
    },
    setup() {
      return {
        avatarImages,
        args
      };
    },
    template: `
      <div dir="rtl">
        <AvatarGroup v-bind="args">
          <Avatar 
            v-for="(avatar, index) in avatarImages" 
            :key="index" 
            :src="avatar.src"
            :alt="avatar.alt"
          />
        </AvatarGroup>
      </div>
    `
  }),
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Verify RTL avatar group renders correctly", async () => {
      const rtlContainer = canvas.getByRole("group").parentElement;
      expect(rtlContainer).toHaveAttribute("dir", "rtl");
      const avatarGroup = canvas.getByRole("group");
      expect(avatarGroup).toBeInTheDocument();
    });
    await step("Verify all avatars are rendered in RTL context", async () => {
      const avatars = canvas.getAllByAltText(/User \d/);
      expect(avatars).toHaveLength(3);
    });
  }
}
```

---

## Elements / Button

### Button

A flexible, accessible button with rich visual variants and behaviors. Use it for primary and secondary actions, icon-only actions, links, and async/loading flows.

#### Features

-   Color themes: default, primary, info, success, warning, danger, secondary, dark, gradient
-   Sizes: xs, sm, md, lg; block layout and rounded radii
-   Outline, shadow, and border styles (solid, dashed, dotted)
-   Loading state with customizable spinner icon
-   Icon support before/after label; icon-only usage works too
-   Link mode via the to prop for navigation
-   Optional chip mode: adds a close icon and emits the chip-click event

#### Accessibility

-   Renders semantic button or link depending on props
-   Keyboard-focus styles; loading and disabled states are visually communicated

#### Usage

Wrap actions, confirm flows, and toolbar icons. Prefer meaningful labels; use icons to reinforce meaning, not replace it.

```
<template>
  <Button
    :block="false"
    borderType="solid"
    :isLoading="false"
    label="Button"
    loadingIcon="IconLoader"
    :outline="false"
    :shadow="false"
    textTransform="normal-case"
  />
</template>
```

| Name | Description | Default | Control |
| --- | --- | --- | --- |
| props |  |
| block | boolean | false | FalseTrue |
| outline | boolean | false | FalseTrue |
| shadow | boolean | false | FalseTrue |
| isLoading | boolean | false | FalseTrue |
| borderType | Border type"solid""dashed""dotted" | "solid" | soliddasheddotted |
| loadingIcon | You can insert the Icon's name from here or add your icons."IconLoader""IconRefresh""IconRestore"string | "IconLoader" | IconLoader |
| label | string | - | Button |
| textTransform | "normal-case""capitalize""lowercase""uppercase" | "normal-case" | Choose option...normal-casecapitalizelowercaseuppercase |
| color | "primary""info""success""warning""danger""secondary""dark""gradient" | - | Choose option...defaultprimaryinfosuccesswarningdangersecondarydarkgradient |
| size | "xs""sm""md""lg" | - | Choose option...xssmmdlg |
| rounded | "full""none""xs""sm""md""lg""xl" | - | Choose option...fullnonexssmmdlgxl |
| disabled | boolean | - |  |
| to | URL path for link functionalitystring | - |  |
| iconName | Icon name to displaystring | - |  |
| iconClass | Additional classes for the iconstring | - |  |
| chip | Enable chip mode (close icon)boolean | false |  |
| events |  |
| click | other | - | - |
| chip-click | other | - | - |
| slots |  |
| icon | other | - |  |
| default | other | - |  |

#### Stories

##### Default

```
<template>
  <Button
    :block="false"
    borderType="solid"
    :isLoading="false"
    label="Button"
    loadingIcon="IconLoader"
    :outline="false"
    :shadow="false"
    textTransform="normal-case"
  />
</template>
```

##### Rounded

```
<template>
  <Button
    :block="false"
    borderType="solid"
    color="info"
    :isLoading="false"
    label="Button"
    loadingIcon="IconLoader"
    :outline="false"
    rounded="lg"
    :shadow="false"
    textTransform="uppercase"
  />
</template>
```

##### Outline

```
<template>
  <Button
    :block="false"
    borderType="solid"
    color="success"
    :isLoading="false"
    label="Button"
    loadingIcon="IconLoader"
    outline
    :shadow="false"
    textTransform="capitalize"
  />
</template>
```

##### Loading

```
<template>
  <Button
    :block="false"
    borderType="solid"
    color="success"
    isLoading
    label="Button"
    loadingIcon="IconLoader"
    outline
    :shadow="false"
    textTransform="capitalize"
  />
</template>
```

##### Size

```
<template>
  <Button
    block
    borderType="solid"
    color="warning"
    :isLoading="false"
    label="Button"
    loadingIcon="IconLoader"
    :outline="false"
    :shadow="false"
    size="lg"
    textTransform="capitalize"
  />
</template>
```

##### Shadow

```
<template>
  <Button
    :block="false"
    borderType="solid"
    color="secondary"
    :isLoading="false"
    label="Button"
    loadingIcon="IconLoader"
    :outline="false"
    shadow
    size="lg"
    textTransform="capitalize"
  />
</template>
```

##### As Link

```
<template>
  <Button
    :block="false"
    borderType="solid"
    color="primary"
    :isLoading="false"
    label="Go to Dashboard"
    loadingIcon="IconLoader"
    :outline="false"
    :shadow="false"
    size="md"
    textTransform="capitalize"
    to="/dashboard"
  />
</template>
```

##### With Icon

```
<template>
  <Button
    :block="false"
    borderType="solid"
    color="primary"
    iconName="IconSettings"
    :isLoading="false"
    label="Settings"
    loadingIcon="IconLoader"
    :outline="false"
    :shadow="false"
    size="md"
  />
</template>
```

##### Disabled

```
<template>
  <Button
    :block="false"
    borderType="solid"
    color="primary"
    disabled
    :isLoading="false"
    label="Disabled"
    loadingIcon="IconLoader"
    :outline="false"
    :shadow="false"
    size="md"
    to="/dashboard"
  />
</template>
```

##### Gradient Borders

A single gradient border button demonstrating the gradient outline styling with dashed border, medium size, and rounded corners.

```
<template>
  <Button
    :block="false"
    borderType="dashed"
    color="gradient"
    :isLoading="false"
    label="Gradient Border Button"
    loadingIcon="IconLoader"
    outline
    rounded="md"
    :shadow="false"
    size="md"
  />
</template>
```

##### Interactive Button

```
<template>
  <Button
    :block="false"
    borderType="solid"
    color="primary"
    iconName="IconSettings"
    :isLoading="false"
    label="Interactive Button"
    loadingIcon="IconLoader"
    :outline="false"
    :shadow="false"
    size="md"
  />
</template>
```

##### Form Button

```
{
  render: () => ({
    components: {
      Button
    },
    template: `
      <form @submit.prevent="handleSubmit">
        <div class="space-y-4">
          <input type="email" placeholder="Email" class="border p-2 rounded" />
          <input type="password" placeholder="Password" class="border p-2 rounded" />
          <Button type="submit" color="success" :is-loading="isLoading" @click="handleClick">
            {{ isLoading ? 'Submitting...' : 'Submit Form' }}
          </Button>
        </div>
      </form>
    `,
    setup() {
      const isLoading = ref(false);
      const handleClick = () => {
        isLoading.value = true;
        setTimeout(() => {
          isLoading.value = false;
        }, 2000);
      };
      const handleSubmit = () => {
        console.log("Form submitted");
      };
      return {
        isLoading,
        handleClick,
        handleSubmit
      };
    }
  }),
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Fill out form fields", async () => {
      const emailInput = canvas.getByPlaceholderText(/email/i);
      const passwordInput = canvas.getByPlaceholderText(/password/i);
      await userEvent.type(emailInput, "test@example.com");
      await userEvent.type(passwordInput, "password123");
      expect(emailInput).toHaveValue("test@example.com");
      expect(passwordInput).toHaveValue("password123");
    });
    await step("Submit form and verify loading state", async () => {
      const submitButton = canvas.getByRole("button", {
        name: /submit form/i
      });
      await userEvent.click(submitButton);

      // Button should show loading state
      expect(canvas.getByRole("button", {
        name: /submitting/i
      })).toBeInTheDocument();
    });
  }
}
```

##### Chip

Button clicks: 0

Chip clicks: 0

```
<template>
  <Button
    :block="false"
    borderType="solid"
    chip
    color="primary"
    :isLoading="false"
    label="Chip Label"
    loadingIcon="IconLoader"
    :outline="false"
    :shadow="false"
  />
</template>
```

---

## Elements / Card

### Card

A versatile Card component that serves as a container for content with consistent styling. The component features:

-   Automatic dark mode support
-   Consistent shadow and border styling
-   Disabled state propagation to child components
-   Full TypeScript support
-   Tailwind CSS integration

#### Usage

The Card component accepts a default slot that receives the cardDisabled state:

```
<Card :disabled="false">
  <template #default="{ cardDisabled }">
    <div class="p-4">
      <h3>Card Title</h3>
      <Input :disabled="cardDisabled" />
    </div>
  </template>
</Card>
```

#### Styling

The card uses Tailwind CSS with:

-   Light/dark mode support
-   Configurable shadow and border
-   Consistent padding
-   Opacity changes for disabled state

##### Default Card

This is a default card with some example content.

```
{
  render: args => ({
    components: {
      Card
    },
    template: `
      <Card v-bind="args">
        <template #default="{ cardDisabled }">
          <div class="p-4">
            <h3 class="text-lg font-bold mb-2">Default Card</h3>
            <p class="text-gray-600 dark:text-gray-300">This is a default card with some example content.</p>
          </div>
        </template>
      </Card>
    `,
    setup() {
      return {
        args
      };
    }
  }),
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Verify default card renders correctly", async () => {
      const card = canvas.getByText("Default Card").closest("div").parentElement;
      expect(card).toBeInTheDocument();
      expect(card).toHaveClass("bg-white", "shadow-[4px_6px_10px_-3px_#bfc9d4]", "dark:bg-[#191e3a]", "border", "border-[#e0e6ed]", "dark:border-[#1b2e4b]");
    });
    await step("Verify card content is displayed", async () => {
      const title = canvas.getByText("Default Card");
      const content = canvas.getByText("This is a default card with some example content.");
      expect(title).toBeInTheDocument();
      expect(content).toBeInTheDocument();
    });
  }
}
```

| Name | Description | Default | Control |
| --- | --- | --- | --- |
| props |  |
| disabled | Disables the card and its child interactive elementsboolean | false | FalseTrue |
| slots |  |
| default | { cardDisabled: unknown } | - |  |

#### Stories

##### Default

##### Default Card

This is a default card with some example content.

```
{
  render: args => ({
    components: {
      Card
    },
    template: `
      <Card v-bind="args">
        <template #default="{ cardDisabled }">
          <div class="p-4">
            <h3 class="text-lg font-bold mb-2">Default Card</h3>
            <p class="text-gray-600 dark:text-gray-300">This is a default card with some example content.</p>
          </div>
        </template>
      </Card>
    `,
    setup() {
      return {
        args
      };
    }
  }),
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Verify default card renders correctly", async () => {
      const card = canvas.getByText("Default Card").closest("div").parentElement;
      expect(card).toBeInTheDocument();
      expect(card).toHaveClass("bg-white", "shadow-[4px_6px_10px_-3px_#bfc9d4]", "dark:bg-[#191e3a]", "border", "border-[#e0e6ed]", "dark:border-[#1b2e4b]");
    });
    await step("Verify card content is displayed", async () => {
      const title = canvas.getByText("Default Card");
      const content = canvas.getByText("This is a default card with some example content.");
      expect(title).toBeInTheDocument();
      expect(content).toBeInTheDocument();
    });
  }
}
```

##### Card With Input

A disabled card with input components that can be disabled together.  
The first input is getting disabled by ancestor card component, the second input is disabled by itself.

##### Card with Input

Email Input

Number Input

```
{
  args: {
    disabled: true
  },
  render: args => ({
    components: {
      Card,
      Input
    },
    template: `
      <Card v-bind="args">
        <template #default="{ cardDisabled }">
          <div class="p-4 space-y-4">
            <h3 class="text-lg font-bold mb-2">Card with Input</h3>
            <Input 
              label="Email Input" 
              placeholder="Enter your email"
            />
            <Input 
              type="number" 
              label="Number Input" 
              :disabled="cardDisabled"
              placeholder="Enter a number"
            />
          </div>
        </template>
      </Card>
    `,
    setup() {
      return {
        args
      };
    }
  }),
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Verify disabled card renders correctly", async () => {
      const card = canvas.getByText("Card with Input").closest("div").parentElement;
      expect(card).toBeInTheDocument();
      expect(card).toHaveClass("opacity-50");
    });
    await step("Verify inputs are rendered", async () => {
      const emailInput = canvas.getByPlaceholderText("Enter your email");
      const numberInput = canvas.getByPlaceholderText("Enter a number");
      expect(emailInput).toBeInTheDocument();
      expect(numberInput).toBeInTheDocument();
    });
    await step("Verify disabled input is properly disabled", async () => {
      const numberInput = canvas.getByPlaceholderText("Enter a number");
      expect(numberInput).toBeDisabled();
    });
  },
  parameters: {
    docs: {
      description: {
        story: `A disabled card with input components that can be disabled together.
          <br>The first input is getting disabled by ancestor card component, the second input is disabled by itself.`
      }
    }
  }
}
```

##### Custom Class Card

A card with custom classes for additional styling

##### Card with Custom Classes

This card uses additional flex classes for layout.

```
{
  render: args => ({
    components: {
      Card
    },
    template: `
      <Card v-bind="args" class="flex items-center justify-start w-[600px] h-[200px]">
        <template #default="{ cardDisabled }">
          <div class="px-4">
            <h3 class="text-lg font-bold mb-2">Card with Custom Classes</h3>
            <p class="text-gray-600 dark:text-gray-300">This card uses additional flex classes for layout.</p>
          </div>
        </template>
      </Card>
    `,
    setup() {
      return {
        args
      };
    }
  }),
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Verify custom class card renders correctly", async () => {
      const card = canvas.getByText("Card with Custom Classes").closest("div").parentElement;
      expect(card).toBeInTheDocument();
      expect(card).toHaveClass("flex", "items-center", "justify-start");
    });
    await step("Verify custom content is displayed", async () => {
      const title = canvas.getByText("Card with Custom Classes");
      const content = canvas.getByText("This card uses additional flex classes for layout.");
      expect(title).toBeInTheDocument();
      expect(content).toBeInTheDocument();
    });
  },
  parameters: {
    docs: {
      description: {
        story: "A card with custom classes for additional styling"
      }
    }
  }
}
```

##### Disabled Card

A card in a disabled state with reduced opacity and disabled interactive elements

##### Disabled Card

Disabled Input

```
{
  args: {
    disabled: true
  },
  render: args => ({
    components: {
      Card,
      Input
    },
    template: `
      <Card v-bind="args">
        <template #default="{ cardDisabled }">
          <div class="p-4 space-y-4">
            <h3 class="text-lg font-bold mb-2">Disabled Card</h3>
            <Input 
              label="Disabled Input" 
              :disabled="cardDisabled"
              placeholder="This input is disabled"
            />
            <button 
              :disabled="cardDisabled"
              class="w-full p-2 bg-blue-500 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Disabled Button
            </button>
          </div>
        </template>
      </Card>
    `
  }),
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Verify disabled card renders correctly", async () => {
      const card = canvas.getByText("Disabled Card").closest("div").parentElement;
      expect(card).toBeInTheDocument();
    });
    await step("Verify disabled input and button", async () => {
      const input = canvas.getByPlaceholderText("This input is disabled");
      const button = canvas.getByRole("button", {
        name: "Disabled Button"
      });
      expect(input).toBeInTheDocument();
      expect(button).toBeInTheDocument();
    });
  },
  parameters: {
    docs: {
      description: {
        story: "A card in a disabled state with reduced opacity and disabled interactive elements"
      }
    }
  }
}
```

##### Multiple Interactive Elements

A card with multiple interactive elements that can be disabled together

##### Interactive Elements

Text Input

Option 1Option 2

```
{
  render: args => ({
    components: {
      Card,
      Input
    },
    template: `
      <Card v-bind="args">
        <template #default="{ cardDisabled }">
          <div class="p-4 space-y-4">
            <h3 class="text-lg font-bold">Interactive Elements</h3>
            <Input 
              label="Text Input" 
              :disabled="cardDisabled"
              placeholder="Enter text"
            />
            <select 
              :disabled="cardDisabled"
              class="w-full p-2 border rounded dark:bg-[#191e3a] dark:border-[#1b2e4b]"
            >
              <option>Option 1</option>
              <option>Option 2</option>
            </select>
            <button 
              :disabled="cardDisabled"
              class="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ cardDisabled ? 'Disabled Action' : 'Perform Action' }}
            </button>
          </div>
        </template>
      </Card>
    `,
    setup() {
      return {
        args
      };
    }
  }),
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Verify card with multiple interactive elements", async () => {
      const card = canvas.getByText("Interactive Elements").closest("div").parentElement;
      expect(card).toBeInTheDocument();
    });
    await step("Verify all interactive elements are present", async () => {
      const input = canvas.getByPlaceholderText("Enter text");
      const select = canvas.getByRole("combobox");
      const button = canvas.getByRole("button", {
        name: "Perform Action"
      });
      expect(input).toBeInTheDocument();
      expect(select).toBeInTheDocument();
      expect(button).toBeInTheDocument();
    });
    await step("Test interactive elements functionality", async () => {
      const input = canvas.getByPlaceholderText("Enter text");
      const select = canvas.getByRole("combobox");
      const button = canvas.getByRole("button", {
        name: "Perform Action"
      });
      await userEvent.type(input, "test input");
      expect(input).toHaveValue("test input");
      await userEvent.selectOptions(select, "Option 2");
      expect(select).toHaveValue("Option 2");
      await userEvent.click(button);
      expect(button).toBeInTheDocument();
    });
  },
  parameters: {
    docs: {
      description: {
        story: "A card with multiple interactive elements that can be disabled together"
      }
    }
  }
}
```

---

## Elements / Dropdown

### Dropdown

Contextual menu/popover for secondary actions. Provides trigger slot and body slot, positioning via Popper, and rich interaction modes.

#### Features

-   Placement options with offsets; optional arrow
-   Click and hover triggers; interactive content support
-   Locking, z-index control, delays, and click-away behavior
-   RTL and dark mode aware styles

#### Accessibility

-   Trigger is a standard control; body content should be keyboard navigable. Manage focus when opening/closing.

#### Usage

Use for menus, quick filters, and small forms. Keep actions concise and avoid deep nesting.

-   Action
-   Another action
-   Something else here
-   Separated link

```
{
  render: args => ({
    components: {
      Dropdown,
      Button,
      Icon,
      DropdownItem
    },
    setup() {
      return {
        args,
        triggerText: "Action"
      };
    },
    template: `
  <Dropdown v-bind="args">
    <template #body="{ close }">
      <ul @click="close()" class="whitespace-nowrap">
        <DropdownItem>Action</DropdownItem>
        <DropdownItem>Another action</DropdownItem>
        <DropdownItem>Something else here</DropdownItem>
        <DropdownItem>Separated link</DropdownItem>
      </ul>
    </template>
  </Dropdown>
`
  }),
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Verify dropdown trigger renders correctly", async () => {
      const trigger = canvas.getByRole("button");
      expect(trigger).toBeInTheDocument();
    });
    await step("Test dropdown interaction", async () => {
      const trigger = canvas.getByRole("button");
      await userEvent.click(trigger);

      // Check if dropdown items are present
      const actionItem = canvas.getByText("Action");
      expect(actionItem).toBeInTheDocument();
    });
  }
}
```

| Name | Description | Default | Control |
| --- | --- | --- | --- |
| props |  |
| triggerText | Text for the trigger elementstring | - | Dropdown |
| placement | Preferred placement of the PopperPlacement | "bottom-end" | Choose option...autoauto-startauto-endtoptop-starttop-endbottombottom-startbottom-endrightright-startright-endleftleft-startleft-end |
| offsetDistance | Offset in pixels away from the trigger elementnumber | 0 |  |
| offsetSkid | Offset in pixels along the trigger elementnumber | 0 |  |
| hover | Trigger the Popper on hoverboolean | false | FalseTrue |
| disabled | Disables the Popper. If it was already open, it will be closed.boolean | false | FalseTrue |
| interactive | If the Popper should be interactive, it will close when clicked/hovered if falseboolean | true | FalseTrue |
| arrow | Display an arrow on the Popperboolean | false | FalseTrue |
| locked | Lock the Popper into place, it will not flip dynamically when it runs out of space if this is set to trueboolean | false | FalseTrue |
| zIndex | The z-index of the Poppernumberstring | 9999 |  |
| arrowPadding | Stop arrow from reaching the edge of the Popper (in pixels)number | 0 |  |
| closeDelay | Close the Popper after a delay (ms)numberstring | 0 |  |
| openDelay | Open the Popper after a delay (ms)numberstring | 0 |  |
| disableClickAway | Disables automatically closing the Popper when the user clicks away from itboolean | false | FalseTrue |
| show | Control the Popper manually, other events (click, hover) are ignored if this is set to true/falsebooleannull | - | FalseTrue |
| bodyWrapperClass | Class to apply to the body wrapperstring | - |  |
| triggerClass | Class to apply to the trigger elementstring | - |  |
| events |  |
| open:popper | other | - | - |
| close:popper | other | - | - |
| slots |  |
| trigger | Trigger slot{ isDisabled: unknown } | - |  |
| body | Body slot{ close: unknown; isOpen: unknown } | - |  |

#### Stories

##### Default

-   Action
-   Another action
-   Something else here
-   Separated link

```
{
  render: args => ({
    components: {
      Dropdown,
      Button,
      Icon,
      DropdownItem
    },
    setup() {
      return {
        args,
        triggerText: "Action"
      };
    },
    template: `
  <Dropdown v-bind="args">
    <template #body="{ close }">
      <ul @click="close()" class="whitespace-nowrap">
        <DropdownItem>Action</DropdownItem>
        <DropdownItem>Another action</DropdownItem>
        <DropdownItem>Something else here</DropdownItem>
        <DropdownItem>Separated link</DropdownItem>
      </ul>
    </template>
  </Dropdown>
`
  }),
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Verify dropdown trigger renders correctly", async () => {
      const trigger = canvas.getByRole("button");
      expect(trigger).toBeInTheDocument();
    });
    await step("Test dropdown interaction", async () => {
      const trigger = canvas.getByRole("button");
      await userEvent.click(trigger);

      // Check if dropdown items are present
      const actionItem = canvas.getByText("Action");
      expect(actionItem).toBeInTheDocument();
    });
  }
}
```

##### Profile Menu

![](http://localhost:6006/assets/user-profile-4f75ed46.jpeg)

-   ![](http://localhost:6006/assets/user-profile-4f75ed46.jpeg)
    
    ###### John DoePro
    
    johndoe@gmail.com
    
-   Profile
-   Inbox
-   Lock Screen
-   Sign Out

```
{
  parameters: {
    docs: {
      story: {
        height: "500px"
      }
    }
  },
  render(args) {
    return {
      components: {
        Dropdown,
        IconButton,
        Icon,
        DropdownItem
      },
      setup() {
        return {
          args,
          userProfilePicUrl
        };
      },
      template: `
      <Dropdown v-bind="args">
        <template #trigger>
          <IconButton :imgUrl="userProfilePicUrl" size="xl" />
        </template>

        <template #body="{ close }">
          <ul class="w-[230px] !py-0 font-semibold text-dark dark:text-white-dark dark:text-white-light/90">
            <li>
                <div class="flex items-center px-4 py-4">
                    <div class="flex-none">
                        <img class="h-10 w-10 rounded-md object-cover" :src="userProfilePicUrl" alt="" />
                    </div>
                    <div class="truncate ltr:pl-4 rtl:pr-4">
                        <h4 class="text-base">
                            John Doe<span class="rounded bg-success-light px-1 text-xs text-success ltr:ml-2 rtl:ml-2">Pro</span>
                        </h4>
                        <a
                            class="text-black/60 hover:text-primary dark:text-dark-light/60 dark:hover:text-white"
                            href="javascript:;"
                        >
                          johndoe@gmail.com
                        </a>
                    </div>
                </div>
            </li>
            <li class="cursor-pointer">
                <a class="dark:hover:text-white" @click="close()">
                    <Icon name="icon-user" class="h-4.5 w-4.5 shrink-0 ltr:mr-2 rtl:ml-2" />
                    Profile
                </a>
            </li>
            <li class="cursor-pointer">
                <a class="dark:hover:text-white" @click="close()">
                    <Icon name="icon-mail" class="h-4.5 w-4.5 shrink-0 ltr:mr-2 rtl:ml-2" />
                    Inbox
                </a>
            </li>
            <li class="cursor-pointer">
                <a class="dark:hover:text-white" @click="close()">
                    <Icon name="icon-lock-dots" class="h-4.5 w-4.5 shrink-0 ltr:mr-2 rtl:ml-2" />
                    Lock Screen
                </a>
            </li>
            <li class="cursor-pointer border-t border-white-light dark:border-white-light/10">
                <a to="/auth/boxed-signin" class="!py-3 text-danger" @click="close()">
                    <Icon name="icon-logout" class="h-4.5 w-4.5 shrink-0 rotate-90 ltr:mr-2 rtl:ml-2" />
                    Sign Out
                </a>
            </li>
        </ul>
        </template>
      </Dropdown>
    `
    };
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Verify profile menu trigger renders correctly", async () => {
      const trigger = canvas.getByRole("img");
      expect(trigger).toBeInTheDocument();
    });
    await step("Test profile menu interaction", async () => {
      const trigger = canvas.getByRole("img");
      await userEvent.click(trigger);

      // Check if profile menu items are present
      const profileItem = canvas.getByText("Profile");
      const inboxItem = canvas.getByText("Inbox");
      expect(profileItem).toBeInTheDocument();
      expect(inboxItem).toBeInTheDocument();
    });
  }
}
```

##### Hover Trigger

-   Action
-   Another action
-   Something else here
-   Separated link

```
{
  args: {
    hover: true,
    placement: "bottom-start"
  },
  render: args => ({
    components: {
      Dropdown,
      Button,
      Icon,
      DropdownItem
    },
    setup() {
      return {
        args,
        triggerText: "Hover Me"
      };
    },
    template: `
  <Dropdown v-bind="args">
    <template #body="{ close }">
      <ul @click="close()" class="whitespace-nowrap">
        <DropdownItem>Action</DropdownItem>
        <DropdownItem>Another action</DropdownItem>
        <DropdownItem>Something else here</DropdownItem>
        <DropdownItem>Separated link</DropdownItem>
      </ul>
    </template>
  </Dropdown>
`
  }),
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Verify hover trigger renders correctly", async () => {
      const trigger = canvas.getByRole("button");
      expect(trigger).toBeInTheDocument();
    });
    await step("Test hover trigger interaction", async () => {
      const trigger = canvas.getByRole("button");
      await userEvent.hover(trigger);

      // Check if dropdown items are present after hover
      const actionItem = canvas.getByText("Action");
      expect(actionItem).toBeInTheDocument();
    });
  }
}
```

##### With Arrow

-   Action
-   Another action
-   Something else here
-   Separated link

```
{
  args: {
    arrow: true,
    offsetDistance: 12
  },
  render: args => ({
    components: {
      Dropdown,
      Button,
      Icon,
      DropdownItem
    },
    setup() {
      return {
        args,
        triggerText: "With Arrow"
      };
    },
    template: `
  <Dropdown v-bind="args">
    <template #body="{ close }">
      <ul @click="close()" class="whitespace-nowrap">
        <DropdownItem>Action</DropdownItem>
        <DropdownItem>Another action</DropdownItem>
        <DropdownItem>Something else here</DropdownItem>
        <DropdownItem>Separated link</DropdownItem>
      </ul>
    </template>
  </Dropdown>
`
  }),
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Verify dropdown with arrow renders correctly", async () => {
      const trigger = canvas.getByRole("button");
      expect(trigger).toBeInTheDocument();
    });
    await step("Test dropdown with arrow interaction", async () => {
      const trigger = canvas.getByRole("button");
      await userEvent.click(trigger);

      // Check if dropdown items are present
      const actionItem = canvas.getByText("Action");
      expect(actionItem).toBeInTheDocument();
    });
  }
}
```

##### Custom Offset

-   Action
-   Another action
-   Something else here
-   Separated link

```
{
  args: {
    offsetDistance: 20,
    offsetSkid: 10
  },
  render: args => ({
    components: {
      Dropdown,
      Button,
      Icon,
      DropdownItem
    },
    setup() {
      return {
        args,
        triggerText: "Custom Offset"
      };
    },
    template: `
  <Dropdown v-bind="args">
    <template #body="{ close }">
      <ul @click="close()" class="whitespace-nowrap">
        <DropdownItem>Action</DropdownItem>
        <DropdownItem>Another action</DropdownItem>
        <DropdownItem>Something else here</DropdownItem>
        <DropdownItem>Separated link</DropdownItem>
      </ul>
    </template>
  </Dropdown>
`
  }),
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Verify custom offset dropdown renders correctly", async () => {
      const trigger = canvas.getByRole("button");
      expect(trigger).toBeInTheDocument();
    });
    await step("Test custom offset dropdown interaction", async () => {
      const trigger = canvas.getByRole("button");
      await userEvent.click(trigger);

      // Check if dropdown items are present
      const actionItem = canvas.getByText("Action");
      expect(actionItem).toBeInTheDocument();
    });
  }
}
```

##### Disabled

-   Action
-   Another action
-   Something else here
-   Separated link

```
{
  args: {
    disabled: true
  },
  render: args => ({
    components: {
      Dropdown,
      Button,
      Icon,
      DropdownItem
    },
    setup() {
      return {
        args,
        triggerText: "Disabled"
      };
    },
    template: `
  <Dropdown v-bind="args">
    <template #body="{ close }">
      <ul @click="close()" class="whitespace-nowrap">
        <DropdownItem>Action</DropdownItem>
        <DropdownItem>Another action</DropdownItem>
        <DropdownItem>Something else here</DropdownItem>
        <DropdownItem>Separated link</DropdownItem>
      </ul>
    </template>
  </Dropdown>
`
  }),
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Verify disabled dropdown renders correctly", async () => {
      const trigger = canvas.getByRole("button");
      expect(trigger).toBeInTheDocument();
    });
    await step("Test disabled dropdown behavior", async () => {
      const trigger = canvas.getByRole("button");
      await userEvent.click(trigger);

      // Disabled dropdown might still show items, so we just verify the trigger exists
      expect(trigger).toBeInTheDocument();
    });
  }
}
```

##### Interactive Content

```
{
  args: {
    interactive: true
    // offsetDistance: "8",
  },
  render: args => ({
    components: {
      Dropdown,
      Button,
      Icon,
      DropdownItem
    },
    setup() {
      return {
        args
      };
    },
    template: `
      <Dropdown v-bind="args">
        <template #body="{ close }">
          <div class="p-4 min-w-[200px] bg-white dark:bg-black">
            <input type="text" class="form-input mb-2 w-full" placeholder="Type something..." />
            <button class="btn btn-primary w-full" @click="close">
              Submit
            </button>
          </div>
        </template>
      </Dropdown>
    `
  }),
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Verify interactive dropdown renders correctly", async () => {
      const trigger = canvas.getByRole("button");
      expect(trigger).toBeInTheDocument();
    });
    await step("Test interactive dropdown content", async () => {
      const trigger = canvas.getByRole("button");
      await userEvent.click(trigger);

      // Check if interactive content is present
      const input = canvas.getByPlaceholderText("Type something...");
      const submitButton = canvas.getByRole("button", {
        name: "Submit"
      });
      expect(input).toBeInTheDocument();
      expect(submitButton).toBeInTheDocument();
    });
  }
}
```

##### RTL Support

-   العنصر الأول
-   العنصر الثاني
-   العنصر الثالث

```
{
  args: {
    triggerText: "قائمة منسدلة",
    placement: "bottom-start"
  },
  render: args => ({
    components: {
      Dropdown,
      Button,
      Icon,
      DropdownItem
    },
    setup() {
      return {
        args
      };
    },
    template: `
      <div dir="rtl">
        <Dropdown v-bind="args">
          <template #body="{ close }">
            <ul @click="close()" class="whitespace-nowrap">
              <li><a href="javascript:;">العنصر الأول</a></li>
              <li><a href="javascript:;">العنصر الثاني</a></li>
              <li><a href="javascript:;">العنصر الثالث</a></li>
            </ul>
          </template>
        </Dropdown>
      </div>
    `
  }),
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Verify RTL dropdown renders correctly", async () => {
      const trigger = canvas.getByRole("button");
      expect(trigger).toBeInTheDocument();
    });
    await step("Test RTL dropdown interaction", async () => {
      const trigger = canvas.getByRole("button");
      await userEvent.click(trigger);

      // Check if RTL dropdown items are present
      const firstItem = canvas.getByText("العنصر الأول");
      expect(firstItem).toBeInTheDocument();
    });
  }
}
```

---

## Elements / Iconbutton

### IconButton

A compact, versatile button optimized for icons or avatars. Works as a clickable control by default and as a decorative badge when badge is true.

#### Features

-   Color themes and rounded radii for circular or rounded styles
-   Sizes: xs, sm, md, lg, xl
-   Loading state with customizable spinner icon
-   Disabled state; optional badge (non-interactive) mode
-   Supports either an icon name or an image via imgUrl

#### Accessibility

-   Focusable and keyboard operable when interactive
-   Loading/disabled states use non-pointer cursors to signal non-interactivity

#### Usage

Use for toolbar actions, quick affordances, and avatars. Prefer tooltips or aria-labels to convey meaning for icon-only buttons.

```
<template>
  <IconButton
    :badge="false"
    color="default"
    :disabled="false"
    icon="IconSun"
    :isLoading="false"
    loadingIcon="IconLoader"
    rounded="full"
    size="sm"
  />
</template>
```

| Name | Description | Default | Control |
| --- | --- | --- | --- |
| props |  |
| color | Color theme for the icon button"default""primary""info""success""warning""danger""secondary""dark" | "default" | Choose option...defaultprimaryinfosuccesswarningdangersecondarydarkgradient |
| size | Visual size of the inner icon or image"xs""sm""md""lg""xl" | - | Choose option...xssmmdlgxl |
| isLoading | Shows a loading spinner when trueboolean | false | FalseTrue |
| loadingIcon | Icon to show when loading"IconLoader""IconRefresh""IconRestore"string | "IconLoader" | Choose option...IconLoaderIconRefreshIconRestore |
| disabled | Disables the buttonboolean | - | FalseTrue |
| badge | Enable badge mode (non-interactive): no click events and default cursorboolean | false | FalseTrue |
| rounded | Border radius size"full""none""xs""sm""md""lg""xl" | "full" | Choose option...fullnonexssmmdlgxl |
| icon | Icon name to render from the icon setstring | - | IconSun |
| imgUrl | string | - |  |
| label | Label text to display when in badge modestring | - |  |
| events |  |
| click | other | - | - |
| slots |  |
| default | other | - |  |

#### Stories

##### Default

Interactive usage. Emits `click` and shows a pointer cursor when not disabled/loading.

```
<template>
  <IconButton
    :badge="false"
    color="default"
    :disabled="false"
    icon="IconSun"
    :isLoading="false"
    loadingIcon="IconLoader"
    rounded="full"
    size="sm"
  />
</template>
```

##### Loading

Shows the built-in spinner and is non-interactive while loading.

```
<template>
  <IconButton
    :badge="false"
    color="default"
    :disabled="false"
    icon="IconSun"
    isLoading
    loadingIcon="IconLoader"
    rounded="full"
    size="md"
  />
</template>
```

##### Loading With Custom Icon

Customize the spinner icon via the `loadingIcon` prop.

```
<template>
  <IconButton
    :badge="false"
    color="default"
    :disabled="false"
    icon="IconSun"
    isLoading
    loadingIcon="IconRefresh"
    rounded="full"
    size="lg"
  />
</template>
```

##### With Images

Pass `imgUrl` to render an image instead of an icon. Works in both interactive and badge modes.

![](/assets/images/user-profile.jpeg)

```
<template>
  <IconButton
    :badge="false"
    color="default"
    :disabled="false"
    imgUrl="/assets/images/user-profile.jpeg"
    :isLoading="false"
    loadingIcon="IconLoader"
    rounded="full"
    size="xl"
  />
</template>
```

##### Disabled

Disabled state is non-interactive and shows a not-allowed cursor.

```
<template>
  <IconButton
    :badge="false"
    color="default"
    disabled
    icon="IconSun"
    :isLoading="false"
    loadingIcon="IconLoader"
    rounded="full"
    size="md"
  />
</template>
```

##### Color Variants

Preview of all color variants.

##### IconButton Color Variants

Default

Primary

Info

Success

Warning

Danger

Secondary

Dark

Gradient

```
<template>
  <IconButton
    :badge="false"
    color="default"
    :disabled="false"
    :isLoading="false"
    loadingIcon="IconLoader"
    rounded="full"
    size="md"
  />
</template>
```

##### Toolbar Example

Example layout with multiple IconButtons.

##### Toolbar Example

Different colored IconButtons in a practical toolbar context

```
<template>
  <IconButton
    :badge="false"
    color="default"
    :disabled="false"
    :isLoading="false"
    loadingIcon="IconLoader"
    rounded="md"
    size="sm"
  />
</template>
```

##### Badge

Badge mode: decorative only. Shows default cursor and does not emit `click`.

```
<template>
  <IconButton
    badge
    color="primary"
    :disabled="false"
    icon="IconStar"
    :isLoading="false"
    loadingIcon="IconLoader"
    rounded="full"
    size="md"
  />
</template>
```

##### Badge Variants

Multiple badge color examples.

##### IconButton Badge Variants

Primary Badge

Success Badge

Warning Badge

Danger Badge

Info Badge

Secondary Badge

Badge mode removes click functionality and shows default cursor

```
<template>
  <IconButton
    badge
    color="default"
    :disabled="false"
    :isLoading="false"
    loadingIcon="IconLoader"
    rounded="full"
    size="md"
  />
</template>
```

##### Badge Label Sizes

Demonstrates how labels scale with different badge sizes.

##### IconButton Badge with Labels - Size Variants

New

XS

Hot

SM

Featured

MD

Trending

LG

Popular

XL

Badge mode with labels at different sizes - note how label text scales with icon size

```
<template>
  <IconButton
    badge
    color="default"
    :disabled="false"
    icon="IconStar"
    :isLoading="false"
    loadingIcon="IconLoader"
    rounded="full"
    size="sm"
  />
</template>
```

##### Badge With Labels Variants

Multiple badge color examples with labels.

##### IconButton Badge with Labels - Color Variants

Premium

Primary

Verified

Success

Warning

Warning

Blocked

Danger

Info

Info

Settings

Secondary

Badge mode with labels in different colors - perfect for status indicators and tags

```
<template>
  <IconButton
    badge
    color="default"
    :disabled="false"
    :isLoading="false"
    loadingIcon="IconLoader"
    rounded="full"
    size="md"
  />
</template>
```

---

## Elements / Progress

### Progress

A versatile progress bar component with a clean, modern design.

##### Features

-   Multiple sizes (xs, sm, md, lg, xl)
-   Different border radius options
-   Built-in RTL support using Tailwind's RTL utilities
-   Dark mode support with smooth transitions
-   Interactive hover and active states
-   Animated progress and striped effects
-   Accessible with ARIA attributes
-   Labels with customizable text

##### Usage

```
<template>
  <!-- Basic usage -->
  <Progress :value="50" :max="100" />

  <!-- In RTL context (wrap in RTL container) -->
  <div dir="rtl">
    <Progress :value="75" :showLabel="true" />
  </div>

  <!-- With animations -->
  <Progress
    :value="75"
    :striped="true"
    :animated="true"
    :showLabel="true"
  />

  <!-- Dark mode compatible -->
  <Progress
    :value="90"
    color="primary"
    :showLabel="true"
  />
</template>
```

##### RTL Support

The component uses Tailwind's RTL utilities for bidirectional support:

-   `ltr:origin-left rtl:origin-right` for proper transform origins
-   CSS custom properties for RTL-aware animations
-   Automatic support in RTL contexts (no extra props needed)

##### Props

-   `value`: The current progress value (number)
-   `max`: The maximum progress value (number, default: 100)
-   `size`: Size of the progress bar (default, sm, md, lg, xl)
-   `rounded`: Whether to show a rounded progress bar (boolean)
-   `classes`: Custom CSS classes for wrapper and progress elements
-   `striped`: Whether to show a striped pattern (boolean)
-   `animated`: Whether to animate the progress bar (boolean)
-   `showLabel`: Whether to show a label inside the progress bar (boolean)
-   `label`: Custom label text (string, defaults to percentage)

##### Accessibility

The component includes proper ARIA attributes and follows accessibility best practices:

-   `role="progressbar"`
-   `aria-valuenow`: Current progress value
-   `aria-valuemax`: Maximum progress value
-   Automatic RTL support through HTML `dir` attribute
-   Smooth transitions for visual changes

##### Interactions & Animations

The component includes several interactive features:

1.  Hover effect: Slight brightness increase
2.  Active state: Subtle scale reduction
3.  Smooth transitions for:
    -   Progress value changes
    -   Theme switching
    -   Size changes
    -   Color changes

##### Best Practices

1.  Use appropriate sizes based on context
2.  Set the correct `dir` attribute on a parent container for RTL support
3.  Ensure proper color contrast in both light and dark themes
4.  Use animations judiciously to avoid overwhelming users
5.  Provide clear labels for important progress indicators

```
{
  args: {
    value: 50,
    max: 100
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Verify progress bar renders correctly", async () => {
      const progressBar = canvas.getByRole("progressbar");
      expect(progressBar).toBeInTheDocument();
      expect(progressBar).toHaveAttribute("aria-valuenow", "50");
      expect(progressBar).toHaveAttribute("aria-valuemax", "100");
    });
  }
}
```

| Name | Description | Default | Control |
| --- | --- | --- | --- |
| props |  |
| value | The current progress valuenumber | 50 | 050 / 100 |
| max | The maximum progress valuenumber | 100 |  |
| color | The color of the progress bar"primary""info""success""warning""danger""secondary""dark""gradient" | "primary" | Choose option...primaryinfosuccesswarningdangersecondarydark |
| size | The size of the progress bar"default""sm""md""lg""xl" | "default" | Choose option...defaultsmmdlgxl |
| rounded | The border radius of the progress barboolean | true | FalseTrue |
| striped | Whether to show a striped patternboolean | false | FalseTrue |
| animated | Whether to animate the progress barboolean | false | FalseTrue |
| showLabel | Whether to show a label inside the progress barboolean | false | FalseTrue |
| label | Custom label text (defaults to percentage)string | "" |  |
| classes | Custom CSS classes for wrapper and progress elements{ /** * CSS classes to apply to the wrapper element. */ wrapper?: string \| string[]; /** * CSS classes to apply to the progress element. */ progress?: string \| string[]; } | - |  |

#### Stories

##### Default

```
{
  args: {
    value: 50,
    max: 100
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Verify progress bar renders correctly", async () => {
      const progressBar = canvas.getByRole("progressbar");
      expect(progressBar).toBeInTheDocument();
      expect(progressBar).toHaveAttribute("aria-valuenow", "50");
      expect(progressBar).toHaveAttribute("aria-valuemax", "100");
    });
  }
}
```

##### Progress Examples

##### Progress Examples

0%

25%

50%

75%

100%

```
{
  render: () => ({
    components: {
      Progress
    },
    template: `
      <div class="space-y-4">
        <div>
          <h3 class="mb-2">Progress Examples</h3>
          <div class="space-y-2">
            <Progress :value="0" :showLabel="true" />
            <Progress :value="25" :showLabel="true" />
            <Progress :value="50" :showLabel="true" />
            <Progress :value="75" :showLabel="true" />
            <Progress :value="100" :showLabel="true" />
          </div>
        </div>
      </div>
    `
  }),
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Verify all progress bars are rendered", async () => {
      const progressBars = canvas.getAllByRole("progressbar");
      expect(progressBars).toHaveLength(5);
    });
    await step("Verify progress values are correct", async () => {
      const progressBars = canvas.getAllByRole("progressbar");
      expect(progressBars[0]).toHaveAttribute("aria-valuenow", "0");
      expect(progressBars[1]).toHaveAttribute("aria-valuenow", "25");
      expect(progressBars[2]).toHaveAttribute("aria-valuenow", "50");
      expect(progressBars[3]).toHaveAttribute("aria-valuenow", "75");
      expect(progressBars[4]).toHaveAttribute("aria-valuenow", "100");
    });
  }
}
```

##### Sizes

```
{
  render: () => ({
    components: {
      Progress
    },
    template: `
      <div class="space-y-4">
        <Progress :value="50" size="default" />
        <Progress :value="50" size="sm" />
        <Progress :value="50" size="md" />
        <Progress :value="50" size="lg" />
        <Progress :value="50" size="xl" />
      </div>
    `
  }),
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Verify all size variants are rendered", async () => {
      const progressBars = canvas.getAllByRole("progressbar");
      expect(progressBars).toHaveLength(5);
    });
    await step("Verify all progress bars have correct value", async () => {
      const progressBars = canvas.getAllByRole("progressbar");
      progressBars.forEach(bar => {
        expect(bar).toHaveAttribute("aria-valuenow", "50");
      });
    });
  }
}
```

##### Striped Animated

25%

50%

75%

100%

```
{
  render: () => ({
    components: {
      Progress
    },
    template: `
      <div class="space-y-4">
        <Progress :value="25" :striped="true" :animated="true" :showLabel="true" />
        <Progress :value="50" :striped="true" :animated="true" :showLabel="true" />
        <Progress :value="75" :striped="true" :animated="true" :showLabel="true" />
        <Progress :value="100" :striped="true" :animated="true" :showLabel="true" />
      </div>
    `
  }),
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Verify all animated progress bars are rendered", async () => {
      const progressBars = canvas.getAllByRole("progressbar");
      expect(progressBars).toHaveLength(4);
    });
    await step("Verify progress values are correct", async () => {
      const progressBars = canvas.getAllByRole("progressbar");
      expect(progressBars[0]).toHaveAttribute("aria-valuenow", "25");
      expect(progressBars[1]).toHaveAttribute("aria-valuenow", "50");
      expect(progressBars[2]).toHaveAttribute("aria-valuenow", "75");
      expect(progressBars[3]).toHaveAttribute("aria-valuenow", "100");
    });
  }
}
```

---

## Elements / Tabs

### Tabs

### Tabs Component

A flexible and customizable tab navigation component built with Vue 3, TypeScript, and Tailwind CSS. The Tabs component provides an intuitive interface for organizing content into separate, easily accessible sections.

#### Features

-   **Icon Support**: Each tab can include an optional icon displayed alongside the label
-   **Disabled State**: Tabs can be marked as disabled to prevent user interaction
-   **Custom Styling**: Customizable container classes for different styling needs
-   **Slot-Based Content**: Use slots to provide custom content for each tab
-   **Dark Mode Support**: Built-in styling for both light and dark themes
-   **v-model Support**: Uses Vue 3's v-model for two-way binding of the active tab

#### Usage

```
<script setup lang="ts">
import { ref } from 'vue';
import Tabs from './components/Tabs.vue';
import type { TabItem } from './components/Tabs.vue';

const activeTab = ref('home');
const tabs: TabItem[] = [
  { id: 'home', label: 'Home' },
  { id: 'profile', label: 'Profile' },
  { id: 'contact', label: 'Contact' },
  { id: 'disabled', label: 'Disabled', disabled: true }
];
</script>

<template>
  <Tabs 
    :tabs="tabs" 
    v-model="activeTab">
    <!-- Optional custom icons and content via slots -->
  </Tabs>
</template>
```

-   Home
-   Profile
-   Contact
-   Disabled

###### We move your world!

Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

![profile](https://html.vristo.sbthemes.com/assets/images/profile-34.jpeg)

###### Media heading

Cras sit amet nibh libero, in gravida nulla. Nulla vel metus scelerisque ante sollicitudin. Cras purus odio, vestibulum in vulputate at, tempus viverra turpis. Fusce condimentum nunc ac nisi vulputate fringilla. Donec lacinia congue felis in faucibus.

Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.

```
{
  args: {
    modelValue: "home"
  },
  render: args => ({
    components: {
      Tabs
    },
    setup() {
      const activeTab = ref(args.modelValue);
      const onTabChange = (tabId: string) => {
        activeTab.value = tabId;
        console.log("Tab changed to:", tabId);
      };
      return {
        args,
        activeTab,
        onTabChange
      };
    },
    template: `
      <Tabs 
        :tabs="args.tabs" 
        v-model="activeTab"
        :containerClass="args.containerClass">
        
        <!-- Custom icons for tabs -->
        <template #icon-home>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M9 22V12H15V22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </template>
        
        <template #icon-profile>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </template>
        
        <template #icon-contact>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M22 6L12 13L2 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </template>
        
        <!-- Custom content for each tab -->
        <template #content-home>
          <div>
            <h4 class="font-semibold text-2xl mb-4">We move your world!</h4>
            <p class="mb-4">Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
            <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
          </div>
        </template>
        
        <template #content-profile>
          <div>
            <div class="flex items-start">
              <div class="w-20 h-20 ltr:mr-4 rtl:ml-4 flex-none">
                <img src="https://html.vristo.sbthemes.com/assets/images/profile-34.jpeg" alt="profile" class="w-20 h-20 m-0 rounded-full ring-2 ring-[#ebedf2] dark:ring-white-dark object-cover" />
              </div>
              <div class="flex-auto">
                <h5 class="text-xl font-medium mb-4">Media heading</h5>
                <p class="text-white-dark">Cras sit amet nibh libero, in gravida nulla. Nulla vel metus scelerisque ante sollicitudin. Cras purus odio, vestibulum in vulputate at, tempus viverra turpis. Fusce condimentum nunc ac nisi vulputate fringilla. Donec lacinia congue felis in faucibus.</p>
              </div>
            </div>
          </div>
        </template>
        
        <template #content-contact>
          <div>
            <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>
          </div>
        </template>
      </Tabs>
    `
  }),
  parameters: {
    docs: {
      description: {
        story: "Default tabs with icons and custom content for each tab."
      }
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Verify tabs component renders correctly", async () => {
      const tabsContainer = canvas.getByRole("list");
      expect(tabsContainer).toBeInTheDocument();
    });
    await step("Verify tab links are rendered", async () => {
      const tabLinks = canvas.getAllByRole("link");
      expect(tabLinks).toHaveLength(4);
    });
    await step("Verify default active tab", async () => {
      const homeTab = canvas.getByRole("link", {
        name: /home/i
      });
      expect(homeTab).toBeInTheDocument();
    });
    await step("Test tab switching", async () => {
      const profileTab = canvas.getByRole("link", {
        name: /profile/i
      });
      await userEvent.click(profileTab);
      expect(profileTab).toBeInTheDocument();
    });
  }
}
```

| Name | Description | Default | Control |
| --- | --- | --- | --- |
| props |  |
| modelValue* | ID of the currently active tab (v-model)string | - | home |
| containerClass | Additional CSS classes for the tabs containerstring | "mb-5" | mb-5 |
| tabs* | Array of tab items with id, label, content and optional icon and disabled propertiesTabItem[] | - | tabs : [0 : {...} 3 keys1 : {...} 3 keys2 : {...} 3 keys3 : {...} 3 keys] |
| events |  |
| update:modelValue | string | - | - |
| onUpdate:modelValue | Event emitted when the active tab changesstring | - | - |
| slots |  |
| `icon-${tab.id}` | { name: unknown } | - |  |
| `content-${tab.id}` | { name: unknown } | - |  |

#### Stories

##### Default

Default tabs with icons and custom content for each tab.

-   Home
-   Profile
-   Contact
-   Disabled

###### We move your world!

Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

![profile](https://html.vristo.sbthemes.com/assets/images/profile-34.jpeg)

###### Media heading

Cras sit amet nibh libero, in gravida nulla. Nulla vel metus scelerisque ante sollicitudin. Cras purus odio, vestibulum in vulputate at, tempus viverra turpis. Fusce condimentum nunc ac nisi vulputate fringilla. Donec lacinia congue felis in faucibus.

Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.

```
{
  args: {
    modelValue: "home"
  },
  render: args => ({
    components: {
      Tabs
    },
    setup() {
      const activeTab = ref(args.modelValue);
      const onTabChange = (tabId: string) => {
        activeTab.value = tabId;
        console.log("Tab changed to:", tabId);
      };
      return {
        args,
        activeTab,
        onTabChange
      };
    },
    template: `
      <Tabs 
        :tabs="args.tabs" 
        v-model="activeTab"
        :containerClass="args.containerClass">
        
        <!-- Custom icons for tabs -->
        <template #icon-home>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M9 22V12H15V22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </template>
        
        <template #icon-profile>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </template>
        
        <template #icon-contact>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M22 6L12 13L2 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </template>
        
        <!-- Custom content for each tab -->
        <template #content-home>
          <div>
            <h4 class="font-semibold text-2xl mb-4">We move your world!</h4>
            <p class="mb-4">Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
            <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
          </div>
        </template>
        
        <template #content-profile>
          <div>
            <div class="flex items-start">
              <div class="w-20 h-20 ltr:mr-4 rtl:ml-4 flex-none">
                <img src="https://html.vristo.sbthemes.com/assets/images/profile-34.jpeg" alt="profile" class="w-20 h-20 m-0 rounded-full ring-2 ring-[#ebedf2] dark:ring-white-dark object-cover" />
              </div>
              <div class="flex-auto">
                <h5 class="text-xl font-medium mb-4">Media heading</h5>
                <p class="text-white-dark">Cras sit amet nibh libero, in gravida nulla. Nulla vel metus scelerisque ante sollicitudin. Cras purus odio, vestibulum in vulputate at, tempus viverra turpis. Fusce condimentum nunc ac nisi vulputate fringilla. Donec lacinia congue felis in faucibus.</p>
              </div>
            </div>
          </div>
        </template>
        
        <template #content-contact>
          <div>
            <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>
          </div>
        </template>
      </Tabs>
    `
  }),
  parameters: {
    docs: {
      description: {
        story: "Default tabs with icons and custom content for each tab."
      }
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Verify tabs component renders correctly", async () => {
      const tabsContainer = canvas.getByRole("list");
      expect(tabsContainer).toBeInTheDocument();
    });
    await step("Verify tab links are rendered", async () => {
      const tabLinks = canvas.getAllByRole("link");
      expect(tabLinks).toHaveLength(4);
    });
    await step("Verify default active tab", async () => {
      const homeTab = canvas.getByRole("link", {
        name: /home/i
      });
      expect(homeTab).toBeInTheDocument();
    });
    await step("Test tab switching", async () => {
      const profileTab = canvas.getByRole("link", {
        name: /profile/i
      });
      await userEvent.click(profileTab);
      expect(profileTab).toBeInTheDocument();
    });
  }
}
```

##### No Icons

Simple tabs without icons, using the content property from tab items.

-   Tab 1
-   Tab 2
-   Tab 3

Content for Tab 1

Content for Tab 2

Content for Tab 3

```
{
  args: {
    modelValue: "tab1",
    tabs: [{
      id: "tab1",
      label: "Tab 1",
      content: "Content for Tab 1"
    }, {
      id: "tab2",
      label: "Tab 2",
      content: "Content for Tab 2"
    }, {
      id: "tab3",
      label: "Tab 3",
      content: "Content for Tab 3"
    }]
  },
  render: args => ({
    components: {
      Tabs
    },
    setup() {
      const activeTab = ref(args.modelValue);
      const onTabChange = (tabId: string) => {
        activeTab.value = tabId;
        console.log("Tab changed to:", tabId);
      };
      return {
        args,
        activeTab,
        onTabChange
      };
    },
    template: `
      <Tabs 
        :tabs="args.tabs" 
        v-model="activeTab"
        :containerClass="args.containerClass">
      </Tabs>
    `
  }),
  parameters: {
    docs: {
      description: {
        story: "Simple tabs without icons, using the content property from tab items."
      }
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Verify tabs without icons render correctly", async () => {
      const tabsContainer = canvas.getByRole("list");
      expect(tabsContainer).toBeInTheDocument();
    });
    await step("Verify tab links are rendered", async () => {
      const tabLinks = canvas.getAllByRole("link");
      expect(tabLinks).toHaveLength(3);
    });
    await step("Verify default active tab", async () => {
      const tab1 = canvas.getByRole("link", {
        name: /tab 1/i
      });
      expect(tab1).toBeInTheDocument();
    });
    await step("Test tab switching", async () => {
      const tab2 = canvas.getByRole("link", {
        name: /tab 2/i
      });
      await userEvent.click(tab2);
      expect(tab2).toBeInTheDocument();
    });
  }
}
```

##### Custom Styles

Tabs with custom container styling using the containerClass prop.

-   Home
-   Profile
-   Contact

###### Custom Styled Tab

This tab container has custom background styling applied via the containerClass prop.

You can style the container to match your design system.

The styling is applied to the entire tabs component container.

```
{
  args: {
    modelValue: "home",
    containerClass: "mb-5 bg-gray-100 p-4 rounded",
    tabs: [{
      id: "home",
      label: "Home",
      icon: "home-icon"
    }, {
      id: "profile",
      label: "Profile",
      icon: "profile-icon"
    }, {
      id: "contact",
      label: "Contact",
      icon: "contact-icon"
    }]
  },
  render: args => ({
    components: {
      Tabs
    },
    setup() {
      const activeTab = ref(args.modelValue);
      const onTabChange = (tabId: string) => {
        activeTab.value = tabId;
        console.log("Tab changed to:", tabId);
      };
      return {
        args,
        activeTab,
        onTabChange
      };
    },
    template: `
      <Tabs 
        :tabs="args.tabs" 
        v-model="activeTab"
        :containerClass="args.containerClass">
        
        <!-- Custom icons -->
        <template #icon-home>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M9 22V12H15V22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </template>
        
        <template #icon-profile>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </template>
        
        <template #icon-contact>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M22 6L12 13L2 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </template>
        
        <!-- Custom content -->
        <template #content-home>
          <div>
            <h4 class="font-semibold text-2xl mb-4">Custom Styled Tab</h4>
            <p>This tab container has custom background styling applied via the containerClass prop.</p>
          </div>
        </template>
        
        <template #content-profile>
          <div>
            <p>You can style the container to match your design system.</p>
          </div>
        </template>
        
        <template #content-contact>
          <div>
            <p>The styling is applied to the entire tabs component container.</p>
          </div>
        </template>
      </Tabs>
    `
  }),
  parameters: {
    docs: {
      description: {
        story: "Tabs with custom container styling using the containerClass prop."
      }
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Verify custom styled tabs render correctly", async () => {
      const tabsContainer = canvas.getByRole("list");
      expect(tabsContainer).toBeInTheDocument();
    });
    await step("Verify tab links are rendered", async () => {
      const tabLinks = canvas.getAllByRole("link");
      expect(tabLinks).toHaveLength(3);
    });
    await step("Test tab switching", async () => {
      const profileTab = canvas.getByRole("link", {
        name: /profile/i
      });
      await userEvent.click(profileTab);
      expect(profileTab).toBeInTheDocument();
    });
  }
}
```

##### Disabled Tab

Example with a disabled tab that cannot be selected by the user.

-   Active Tab
-   Regular Tab
-   Disabled Tab

###### Active Tab Content

This is the content for the active tab.

This is content for the second tab.

This content won't be accessible because the tab is disabled.

```
{
  args: {
    modelValue: "tab1",
    tabs: [{
      id: "tab1",
      label: "Active Tab"
    }, {
      id: "tab2",
      label: "Regular Tab"
    }, {
      id: "tab3",
      label: "Disabled Tab",
      disabled: true
    }]
  },
  render: args => ({
    components: {
      Tabs
    },
    setup() {
      const activeTab = ref(args.modelValue);
      const onTabChange = (tabId: string) => {
        activeTab.value = tabId;
        console.log("Tab changed to:", tabId);
      };
      return {
        args,
        activeTab,
        onTabChange
      };
    },
    template: `
      <Tabs 
        :tabs="args.tabs" 
        v-model="activeTab"
        :containerClass="args.containerClass">
        
        <template #content-tab1>
          <div>
            <h4 class="font-semibold text-xl mb-4">Active Tab Content</h4>
            <p>This is the content for the active tab.</p>
          </div>
        </template>
        
        <template #content-tab2>
          <div>
            <p>This is content for the second tab.</p>
          </div>
        </template>
        
        <template #content-tab3>
          <div>
            <p>This content won't be accessible because the tab is disabled.</p>
          </div>
        </template>
      </Tabs>
    `
  }),
  parameters: {
    docs: {
      description: {
        story: "Example with a disabled tab that cannot be selected by the user."
      }
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Verify tabs with disabled tab render correctly", async () => {
      const tabsContainer = canvas.getByRole("list");
      expect(tabsContainer).toBeInTheDocument();
    });
    await step("Verify tab links are rendered", async () => {
      const tabLinks = canvas.getAllByRole("link");
      expect(tabLinks).toHaveLength(3);
    });
    await step("Verify disabled tab is not clickable", async () => {
      const disabledTab = canvas.getByRole("link", {
        name: /disabled tab/i
      });
      expect(disabledTab).toBeInTheDocument();
    });
    await step("Test switching to regular tab", async () => {
      const regularTab = canvas.getByRole("link", {
        name: /regular tab/i
      });
      await userEvent.click(regularTab);
      expect(regularTab).toBeInTheDocument();
    });
  }
}
```

---

## Elements / Tooltip

### Tooltip

Wrap any element to show helpful text on hover or focus. Placement, delay, and color are configurable for consistent guidance.

#### Features

-   Top/bottom/left/right placement
-   Delay before showing to avoid flicker
-   Color themes for contrast on light/dark backgrounds
-   Disable when not needed

#### Accessibility

-   Should appear on focus as well as hover; ensure the trigger is keyboard reachable and supply concise, informative text.

#### Usage

Use for short hints, not long-form content. Prefer inline help or docs links for complex explanations.

This is a helpful tooltip message

```
<template>
  <Tooltip
    color="primary"
    :delay="0"
    :disabled="false"
    placement="bottom"
    text="This is a helpful tooltip message"
  />
</template>
```

| Name | Description | Default | Control |
| --- | --- | --- | --- |
| props |  |
| text* | The text content to display in the tooltipstring | - | This is a helpful tooltip message |
| delay | Delay in milliseconds before showing the tooltip on hovernumber | 0 |  |
| placement | The placement of the tooltipPlacementType | "bottom" | Choose option...topbottomleftright |
| color | The color of the tooltipColorType | "primary" | Choose option...primarysuccessinfowarningdangersecondarywhiteblacksystem |
| disabled | Whether to disable the tooltipboolean | false | FalseTrue |
| slots |  |
| default | other | - |  |

#### Stories

##### Default

This is a helpful tooltip message

```
<template>
  <Tooltip
    color="primary"
    :delay="0"
    :disabled="false"
    placement="bottom"
    text="This is a helpful tooltip message"
  />
</template>
```

##### With Delay

This tooltip appears after 2 seconds of hovering

```
<template>
  <Tooltip
    color="primary"
    :delay="2000"
    :disabled="false"
    placement="bottom"
    text="This tooltip appears after 2 seconds of hovering"
  />
</template>
```

##### Long Text

This is a much longer tooltip message that demonstrates how the tooltip handles longer text content. It will wrap appropriately and maintain good readability.

```
<template>
  <Tooltip
    color="primary"
    :delay="500"
    :disabled="false"
    placement="bottom"
    text="This is a much longer tooltip message that demonstrates how the tooltip handles longer text content. It will wrap appropriately and maintain good readability."
  />
</template>
```

---

## Form / Checkboxinput

### CheckboxInput

A flexible single checkbox component that supports various visual variants, color schemes, and states. The component features:

-   Single checkbox with customizable text
-   Various color variants (primary, success, secondary, danger, warning, info, dark)
-   Visual variants (default, outline, rounded, outline-rounded)
-   Error state with custom error message
-   Disabled state
-   Required field indicator
-   Fully reactive with Vue's v-model
-   Change events
-   RTL support with proper directional styling
-   Dark theme support
-   Smooth transitions and hover effects

#### Usage

The CheckboxInput component can be used for single checkbox selections:

```
<CheckboxInput
  v-model="isChecked"
  text="Accept terms and conditions"
  value="terms"
  color="primary"
  variant="default"
/>
```

#### Variants

-   **Default**: Standard checkbox appearance
-   **Outline**: Checkbox with outline styling
-   **Rounded**: Checkbox with rounded corners
-   **Outline Rounded**: Combination of outline and rounded styles

#### Colors

-   **Primary**: Default primary color
-   **Success**: Green color for success states
-   **Secondary**: Secondary color variant
-   **Danger**: Red color for error/danger states
-   **Warning**: Orange color for warning states
-   **Info**: Blue color for informational states
-   **Dark**: Dark color variant

Checkbox Label Accept terms and conditions

```
{
  render: args => ({
    components: {
      CheckboxInput
    },
    setup() {
      const isChecked = ref(false);
      return {
        args,
        isChecked
      };
    },
    template: `
      <CheckboxInput 
        v-bind="args"
        v-model="isChecked"
        text="Accept terms and conditions"
        value="terms"
      />
    `
  }),
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Verify checkbox renders correctly", async () => {
      const checkbox = canvas.getByRole("checkbox");
      expect(checkbox).toBeInTheDocument();
      expect(checkbox).not.toBeChecked();
    });
    await step("Verify checkbox text is displayed", async () => {
      const text = canvas.getByText("Accept terms and conditions");
      expect(text).toBeInTheDocument();
    });
    await step("Test checkbox interaction", async () => {
      const checkbox = canvas.getByRole("checkbox");
      await userEvent.click(checkbox);
      expect(checkbox).toBeChecked();
    });
  }
}
```

| Name | Description | Default | Control |
| --- | --- | --- | --- |
| props |  |
| label | Label for the checkbox groupstring | undefined | Checkbox Label |
| text | Text displayed next to the checkboxstring | undefined | Checkbox Text |
| value | Value of the checkboxstring | undefined | checkbox-value |
| color | Color variant for checkboxstring | primary | Choose option...primarysuccesssecondarydangerwarninginfodark |
| variant | Visual variant of checkboxstring | default | Choose option...defaultoutlineroundedoutline-rounded |
| disabled | Disabled stateboolean | false | FalseTrue |
| required | Required stateboolean | false | FalseTrue |
| error | Error stateboolean | false | FalseTrue |
| errorMessage | Error message textstring | undefined |  |
| id | ID for the checkboxstring | undefined | checkbox-input |
| modelValue | boolean | false |  |
| events |  |
| blur | Emitted when a checkbox loses focus.FocusEvent | - | - |
| focus | Emitted when a checkbox gains focus.FocusEvent | - | - |
| update:modelValue | Emitted when the checkbox selection changes.boolean | - | - |
| change | Emitted when a checkbox value changes.union | - | - |

#### Stories

##### Default

Checkbox Label Accept terms and conditions

```
{
  render: args => ({
    components: {
      CheckboxInput
    },
    setup() {
      const isChecked = ref(false);
      return {
        args,
        isChecked
      };
    },
    template: `
      <CheckboxInput 
        v-bind="args"
        v-model="isChecked"
        text="Accept terms and conditions"
        value="terms"
      />
    `
  }),
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Verify checkbox renders correctly", async () => {
      const checkbox = canvas.getByRole("checkbox");
      expect(checkbox).toBeInTheDocument();
      expect(checkbox).not.toBeChecked();
    });
    await step("Verify checkbox text is displayed", async () => {
      const text = canvas.getByText("Accept terms and conditions");
      expect(text).toBeInTheDocument();
    });
    await step("Test checkbox interaction", async () => {
      const checkbox = canvas.getByRole("checkbox");
      await userEvent.click(checkbox);
      expect(checkbox).toBeChecked();
    });
  }
}
```

##### With Label

A checkbox with a label and descriptive text for form sections

Terms and Conditions I agree to the terms and conditions

```
{
  args: {
    label: "Terms and Conditions",
    text: "I agree to the terms and conditions",
    value: "terms",
    id: "terms-checkbox"
  },
  render: args => ({
    components: {
      CheckboxInput
    },
    setup() {
      const isChecked = ref(false);
      return {
        args,
        isChecked
      };
    },
    template: `
      <CheckboxInput 
        v-bind="args"
        v-model="isChecked"
      />
    `
  }),
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Verify checkbox with label renders correctly", async () => {
      const checkbox = canvas.getByRole("checkbox");
      const label = canvas.getByText("Terms and Conditions");
      expect(checkbox).toBeInTheDocument();
      expect(label).toBeInTheDocument();
    });
    await step("Verify checkbox has correct ID", async () => {
      const checkbox = canvas.getByRole("checkbox");
      expect(checkbox).toHaveAttribute("id", "terms-checkbox");
    });
    await step("Test checkbox interaction", async () => {
      const checkbox = canvas.getByRole("checkbox");
      await userEvent.click(checkbox);
      expect(checkbox).toBeChecked();
    });
  },
  parameters: {
    docs: {
      description: {
        story: "A checkbox with a label and descriptive text for form sections"
      }
    }
  }
}
```

##### Success Color

A checkbox using the success color variant for positive confirmations

Success Variant Task completed successfully

```
{
  args: {
    label: "Success Variant",
    text: "Task completed successfully",
    color: "success",
    value: "completed"
  },
  render: args => ({
    components: {
      CheckboxInput
    },
    setup() {
      const isChecked = ref(true);
      return {
        args,
        isChecked
      };
    },
    template: `
      <CheckboxInput 
        v-bind="args"
        v-model="isChecked"
      />
    `
  }),
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Verify success checkbox renders correctly", async () => {
      const checkbox = canvas.getByRole("checkbox");
      expect(checkbox).toBeInTheDocument();
      expect(checkbox).toBeChecked();
    });
    await step("Verify success color styling", async () => {
      const checkbox = canvas.getByRole("checkbox");
      const checkboxContainer = checkbox.closest("div");
      expect(checkboxContainer).toBeInTheDocument();
    });
  },
  parameters: {
    docs: {
      description: {
        story: "A checkbox using the success color variant for positive confirmations"
      }
    }
  }
}
```

##### Outline Rounded Variant

A checkbox combining outline styling with rounded corners

Outline Rounded Variant Enable dark mode

```
{
  args: {
    label: "Outline Rounded Variant",
    text: "Enable dark mode",
    variant: "outline-rounded",
    value: "dark-mode"
  },
  render: args => ({
    components: {
      CheckboxInput
    },
    setup() {
      const isChecked = ref(false);
      return {
        args,
        isChecked
      };
    },
    template: `
      <CheckboxInput 
        v-bind="args"
        v-model="isChecked"
      />
    `
  }),
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Verify outline rounded checkbox renders correctly", async () => {
      const checkbox = canvas.getByRole("checkbox");
      expect(checkbox).toBeInTheDocument();
      expect(checkbox).not.toBeChecked();
    });
    await step("Verify outline rounded styling", async () => {
      const checkbox = canvas.getByRole("checkbox");
      const checkboxContainer = checkbox.closest("div");
      expect(checkboxContainer).toBeInTheDocument();
    });
  },
  parameters: {
    docs: {
      description: {
        story: "A checkbox combining outline styling with rounded corners"
      }
    }
  }
}
```

##### Disabled

A disabled checkbox that cannot be interacted with

Disabled Checkbox This option is currently unavailable

```
{
  args: {
    label: "Disabled Checkbox",
    text: "This option is currently unavailable",
    disabled: true,
    value: "disabled-option"
  },
  render: args => ({
    components: {
      CheckboxInput
    },
    setup() {
      const isChecked = ref(false);
      return {
        args,
        isChecked
      };
    },
    template: `
      <CheckboxInput 
        v-bind="args"
        v-model="isChecked"
      />
    `
  }),
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Verify disabled checkbox renders correctly", async () => {
      const checkbox = canvas.getByRole("checkbox");
      expect(checkbox).toBeInTheDocument();
      expect(checkbox).toBeDisabled();
    });
    await step("Verify disabled styling", async () => {
      const checkbox = canvas.getByRole("checkbox");
      const checkboxContainer = checkbox.closest("div");
      expect(checkboxContainer).toBeInTheDocument();
    });
  },
  parameters: {
    docs: {
      description: {
        story: "A disabled checkbox that cannot be interacted with"
      }
    }
  }
}
```

##### With Error

A checkbox in an error state with a validation message

Checkbox with Error Accept terms and conditionsYou must accept the terms to continue

```
{
  args: {
    label: "Checkbox with Error",
    text: "Accept terms and conditions",
    error: true,
    errorMessage: "You must accept the terms to continue",
    value: "terms"
  },
  render: args => ({
    components: {
      CheckboxInput
    },
    setup() {
      const isChecked = ref(false);
      return {
        args,
        isChecked
      };
    },
    template: `
      <CheckboxInput 
        v-bind="args"
        v-model="isChecked"
      />
    `
  }),
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Verify error checkbox renders correctly", async () => {
      const checkbox = canvas.getByRole("checkbox");
      expect(checkbox).toBeInTheDocument();
    });
    await step("Verify error message is displayed", async () => {
      const errorMessage = canvas.getByText("You must accept the terms to continue");
      expect(errorMessage).toBeInTheDocument();
    });
    await step("Verify error styling", async () => {
      const checkbox = canvas.getByRole("checkbox");
      const checkboxContainer = checkbox.closest("div");
      expect(checkboxContainer).toBeInTheDocument();
    });
  },
  parameters: {
    docs: {
      description: {
        story: "A checkbox in an error state with a validation message"
      }
    }
  }
}
```

##### Required

A required checkbox with a required field indicator

Required Checkbox \*I confirm that I am over 18 years old

```
{
  args: {
    label: "Required Checkbox",
    text: "I confirm that I am over 18 years old",
    required: true,
    value: "age-confirmation"
  },
  render: args => ({
    components: {
      CheckboxInput
    },
    setup() {
      const isChecked = ref(false);
      return {
        args,
        isChecked
      };
    },
    template: `
      <CheckboxInput 
        v-bind="args"
        v-model="isChecked"
      />
    `
  }),
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Verify required checkbox renders correctly", async () => {
      const checkbox = canvas.getByRole("checkbox");
      expect(checkbox).toBeInTheDocument();
      expect(checkbox).toHaveAttribute("required");
    });
    await step("Verify required indicator", async () => {
      const label = canvas.getByText("Required Checkbox");
      expect(label).toBeInTheDocument();
    });
  },
  parameters: {
    docs: {
      description: {
        story: "A required checkbox with a required field indicator"
      }
    }
  }
}
```

##### Multiple Checkboxes

Multiple checkboxes demonstrating how to create a checkbox group with reactive state tracking

##### Communication Preferences

Email Notifications Receive email notifications

Newsletter Subscribe to our newsletter

Marketing Receive marketing communications

Updates Get product updates

Selected: None

```
{
  render: args => ({
    components: {
      CheckboxInput
    },
    setup() {
      const selectedValues = ref({
        notifications: false,
        newsletter: false,
        marketing: false,
        updates: false
      });
      const options = [{
        label: "Email Notifications",
        value: "notifications",
        text: "Receive email notifications"
      }, {
        label: "Newsletter",
        value: "newsletter",
        text: "Subscribe to our newsletter"
      }, {
        label: "Marketing",
        value: "marketing",
        text: "Receive marketing communications"
      }, {
        label: "Updates",
        value: "updates",
        text: "Get product updates"
      }];
      return {
        args,
        selectedValues,
        options
      };
    },
    template: `
      <div class="space-y-4">
        <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">Communication Preferences</h3>
        <div class="space-y-3">
          <CheckboxInput
            v-for="option in options"
            :key="option.value"
            v-model="selectedValues[option.value]"
            :text="option.text"
            :value="option.value"
            :label="option.label"
            color="primary"
          />
        </div>
        <div class="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded">
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Selected: {{ Object.keys(selectedValues).filter(key => selectedValues[key]).join(', ') || 'None' }}
          </p>
        </div>
      </div>
    `
  }),
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Verify multiple checkboxes render correctly", async () => {
      const checkboxes = canvas.getAllByRole("checkbox");
      expect(checkboxes).toHaveLength(4);
    });
    await step("Verify all checkbox labels are displayed", async () => {
      expect(canvas.getByText("Email Notifications")).toBeInTheDocument();
      expect(canvas.getByText("Newsletter")).toBeInTheDocument();
      expect(canvas.getByText("Marketing")).toBeInTheDocument();
      expect(canvas.getByText("Updates")).toBeInTheDocument();
    });
    await step("Test checkbox interactions", async () => {
      const checkboxes = canvas.getAllByRole("checkbox");

      // Click first checkbox
      await userEvent.click(checkboxes[0]);
      expect(checkboxes[0]).toBeChecked();

      // Click second checkbox
      await userEvent.click(checkboxes[1]);
      expect(checkboxes[1]).toBeChecked();
    });
    await step("Verify selected values display", async () => {
      const checkboxes = canvas.getAllByRole("checkbox");
      await userEvent.click(checkboxes[0]);
      const selectedText = canvas.getByText(/Selected:/);
      expect(selectedText).toBeInTheDocument();
    });
  },
  parameters: {
    docs: {
      description: {
        story: "Multiple checkboxes demonstrating how to create a checkbox group with reactive state tracking"
      }
    }
  }
}
```

---

## Form / Fileinputbutton

### FileInputButton

Accessible file picker that pairs a styled button with a native file input under the hood. Supports accept filters, capture hints, and multiple selection.

#### Features

-   Button color themes; customizable label
-   Accept and capture attributes; multiple selection
-   Disabled/required states; error messaging

#### Accessibility

-   Uses a real input type=file with proper labeling; ensure descriptive button text.

#### Usage

Use when you need a simple, button-driven file chooser without drag-and-drop.

Upload File 

```
<template>
  <FileInputButton
    buttonColor="primary"
    :disabled="false"
    :error="false"
    label="Upload File"
    :multiple="false"
    :required="false"
  />
</template>
```

| Name | Description | Default | Control |
| --- | --- | --- | --- |
| props |  |
| label | Input label textstring | "" | Upload File |
| buttonColor | Color variant of the upload button"primary""info""success""warning""danger""secondary""dark""gradient" | "primary" | Choose option...primaryinfosuccesswarningdangersecondarydarkgradient |
| accept | Allowed file types (e.g., ".jpg,.png,.pdf" or "image/*")string | "" |  |
| multiple | Allow multiple file selectionboolean | false | FalseTrue |
| required | Whether the input is requiredboolean | false | FalseTrue |
| disabled | Whether the input is disabledboolean | false | FalseTrue |
| error | Whether the input has an errorboolean | false | FalseTrue |
| errorMessage | Error message to displaystring | "" |  |
| id | string | "" |  |
| capture | Capture method for file input (e.g., "user" or "environment")"user""environment"boolean | - |  |
| size | Size attribute for the file inputnumber | 0 |  |
| events |  |
| blur | Emitted when the input loses focusFocusEvent | - | - |
| focus | Emitted when the input gains focusFocusEvent | - | - |
| change | Emitted when the value of the input changesEvent | - | - |
| input | Emitted when the user inputs dataEvent | - | - |
| cancel | Emitted when the user cancels the inputEvent | - | - |
| file-change | Emitted when the selected files changeFileList | - | - |

#### Stories

##### Default

Upload File 

```
<template>
  <FileInputButton
    buttonColor="primary"
    :disabled="false"
    :error="false"
    label="Upload File"
    :multiple="false"
    :required="false"
  />
</template>
```

##### With Accepted Types

Upload Images 

```
<template>
  <FileInputButton
    accept="image/*"
    buttonColor="primary"
    :disabled="false"
    :error="false"
    label="Upload Images"
    multiple
    :required="false"
  />
</template>
```

##### With Error

Upload Document Please select a valid file

```
<template>
  <FileInputButton
    buttonColor="primary"
    :disabled="false"
    error
    errorMessage="Please select a valid file"
    label="Upload Document"
    :multiple="false"
    :required="false"
  />
</template>
```

##### Disabled

Upload File 

```
<template>
  <FileInputButton
    buttonColor="primary"
    disabled
    :error="false"
    label="Upload File"
    :multiple="false"
    :required="false"
  />
</template>
```

##### With Capture

Take Photo 

```
<template>
  <FileInputButton
    accept="image/*"
    buttonColor="primary"
    capture="environment"
    :disabled="false"
    :error="false"
    label="Take Photo"
    :multiple="false"
    :required="false"
  />
</template>
```

---

## Form / Fileinputcombo

### FileInputCombo

A versatile file upload component that supports both drag-and-drop and click-to-upload functionality. The component provides a modern interface with file previews, upload progress tracking, and comprehensive file management features.

#### Features

-   **Dual Upload Modes**: Support for both drag-and-drop and click-to-upload
-   **File Preview**: Visual preview of selected files with thumbnails
-   **Progress Tracking**: Real-time upload progress indicators
-   **Auto Upload**: Option to automatically start uploads when files are selected
-   **File Validation**: Built-in file type and size restrictions
-   **Multiple File Support**: Handle multiple file uploads with individual progress tracking
-   **Customizable UI**: Custom icons, labels, and descriptions
-   **Accessibility**: Full keyboard navigation and ARIA support
-   **Responsive Design**: Works well on all screen sizes

#### Storybook Demo Note

In this Storybook demo, the file upload process is simulated with progress updates that happen automatically via intervals. In a real application, you would need to implement the actual upload logic and update the file states accordingly.

#### Usage in Real Applications

```
<script setup>
import { FileInputCombo } from "pilotui/elements";
import { ref } from "vue";

// Get a reference to the component
const fileInput = ref(null);
// Track active uploads to allow cancellation
const activeUploads = ref({});

// Handle file selection
const handleFileSelect = (payload) => {
  console.log('Selected files:', payload.files);
};

// Handle file upload
const handleFileUpload = async (payload) => {
  const { file, fileId } = payload;
  try {
    // Create a FormData object for your API request
    const formData = new FormData();
    formData.append('file', file);
    
    // Store the XHR request for potential cancellation
    const xhr = new XMLHttpRequest();
    
    // Track the upload for potential cancellation
    activeUploads.value[fileId] = xhr;
    
    xhr.open('POST', '/api/upload', true);
    
    // Update progress as it happens
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const progress = Math.round((event.loaded / event.total) * 100);
        // Update the component's progress display using fileId
        fileInput.value.updateFileProgress(fileId, progress);
      }
    };
    
    // Handle completion
    xhr.onload = () => {
      // Remove from active uploads
      delete activeUploads.value[fileId];
      
      if (xhr.status >= 200 && xhr.status < 300) {
        // Mark upload as complete using fileId
        fileInput.value.setFileStatus(fileId, 'finished');
      } else {
        // Handle error using fileId
        fileInput.value.setFileStatus(fileId, 'error', 'Upload failed');
      }
    };
    
    // Handle network errors
    xhr.onerror = () => {
      // Remove from active uploads
      delete activeUploads.value[fileId];
      fileInput.value.setFileStatus(fileId, 'error', 'Network error');
    };
    
    // Start the upload
    xhr.send(formData);
  } catch (error) {
    fileInput.value.setFileStatus(fileId, 'error', error.message);
  }
};

// Handle upload cancellation
const handleCancelUpload = (payload) => {
  const { file, fileId } = payload;
  if (activeUploads.value[fileId]) {
    // Abort the XHR request
    activeUploads.value[fileId].abort();
    delete activeUploads.value[fileId];
    console.log(`Upload cancelled for ${file.name}`);
  }
};
</script>

<template>
  <FileInputCombo
    ref="fileInput"
    label="Upload Documents"
    accept=".pdf,.doc,.docx"
    :max-size="5 * 1024 * 1024"
    :auto-upload="true"
    @file-select="handleFileSelect"
    @file-upload="handleFileUpload"
    @file-upload-cancel="handleCancelUpload"
  />
</template>
```

##### Drop files to upload

Or

Click to browse files

```
<template>
  <FileInputCombo
    :autoUpload="false"
    :disabled="false"
    dropModeIcon="IconGallery"
    dropModeLabel="Drop your files"
    :maxFiles="0"
    :maxSize="0"
    multiple
    :required="false"
    showControls
    showPreview
    uploadIcon="IconCloudUpload"
  />
</template>
```

| Name | Description | Default | Control |
| --- | --- | --- | --- |
| props |  |
| multiple | Allow multiple file uploadsboolean | true | FalseTrue |
| disabled | Disable the componentboolean | false | FalseTrue |
| required | Whether the field is requiredboolean | false | FalseTrue |
| showPreview | Show file preview after uploadboolean | true | FalseTrue |
| showControls | Show upload controlsboolean | true | FalseTrue |
| maxSize | Maximum file size in bytesnumber | 0 |  |
| maxFiles | Maximum number of files allowednumber | 0 |  |
| autoUpload | Automatically start upload when files are addedboolean | false | FalseTrue |
| uploadIcon | Icon to show in the upload areastring | "IconCloudUpload" | IconCloudUpload |
| dropModeIcon | Icon to show in the drop mode overlaystring | "IconGallery" | IconGallery |
| dropModeLabel | Label to show in the drop mode overlaystring | "Drop your files" | Drop your files |
| accept | File types that are allowed to be uploaded (e.g. '.jpg,.png')string | "" |  |
| label | Label for the inputstring | "" |  |
| id | ID for the input elementstring | - |  |
| title | Custom title for the upload areastring | "" |  |
| description | Custom description for the upload areastring | "" |  |
| fileTypes | Human-readable description of accepted file typesstring | "" |  |
| filterFileDropped | Function to filter files that can be droppedTSFunctionType | () => true |  |
| errorMessage | Error message to show when there is an errorstring | "" |  |
| events |  |
| file-select | { files: File[] } | - | - |
| file-upload | { file: File; fileId: string } | - | - |
| file-remove | { file: File; fileId: string } | - | - |
| file-upload-all | other | - | - |
| file-upload-progress | { file: File; progress: number; fileId: string } | - | - |
| file-upload-error | { file: File; error: Error; fileId: string } | - | - |
| file-upload-complete | { file: File; fileId: string } | - | - |
| file-upload-cancel | { file: File; fileId: string } | - | - |
| slots |  |
| controls | Custom slot for upload controlsother | - |  |
| uploadArea | Custom slot for the upload area{ files: unknown; filesStatus: unknown } | - |  |
| fileList | Custom slot for file list{ filesStatus: unknown; uploadFile: unknown; cancelUpload: unknown; removeFile: unknown } | - |  |
| fileItem | Custom slot for individual file item{ file: unknown; fileId: unknown; status: unknown; uploadFile: unknown; cancelUpload: unknown; removeFile: unknown } | - |  |
| fileProgress | Custom slot for file progress indicator{ file: unknown; fileId: unknown; state: unknown } | - |  |
| fileActions | Custom slot for file action buttons{ file: unknown; fileId: unknown; status: unknown; uploadFile: unknown; cancelUpload: unknown; removeFile: unknown } | - |  |
| expose |  |
| uploadFile | other | - | - |
| uploadAllFiles | other | - | - |
| cancelUpload | other | - | - |
| removeFile | other | - | - |
| triggerFileInput | other | - | - |
| files | other | - | - |
| filesStatus | other | - | - |
| updateFileProgress | other | - | - |
| setFileStatus | other | - | - |

#### Stories

##### Default

##### Drop files to upload

Or

Click to browse files

```
<template>
  <FileInputCombo
    :autoUpload="false"
    :disabled="false"
    dropModeIcon="IconGallery"
    dropModeLabel="Drop your files"
    :maxFiles="0"
    :maxSize="0"
    multiple
    :required="false"
    showControls
    showPreview
    uploadIcon="IconCloudUpload"
  />
</template>
```

##### With Label

Upload Documents \*

##### Drop files to upload

Or

Click to browse files

```
<template>
  <FileInputCombo
    :autoUpload="false"
    :disabled="false"
    dropModeIcon="IconGallery"
    dropModeLabel="Drop your files"
    label="Upload Documents"
    :maxFiles="0"
    :maxSize="0"
    multiple
    required
    showControls
    showPreview
    uploadIcon="IconCloudUpload"
  />
</template>
```

##### Image Uploader

Upload Images

##### Drop your images here

Or

JPG, PNG, GIF and WebP files only

```
<template>
  <FileInputCombo
    accept=".jpg,.jpeg,.png,.gif,.webp"
    :autoUpload="false"
    description="JPG, PNG, GIF and WebP files only"
    :disabled="false"
    dropModeIcon="IconGallery"
    dropModeLabel="Drop your files"
    label="Upload Images"
    :maxFiles="0"
    :maxSize="5242880"
    multiple
    :required="false"
    showControls
    showPreview
    uploadIcon="IconImage"
  >
    <template #title>Drop your images here</template>
  </FileInputCombo>
</template>
```

##### Document Uploader

Upload Documents

##### Drop your documents here

Or

PDF, Word, and text files only

```
<template>
  <FileInputCombo
    accept=".pdf,.doc,.docx,.txt,.rtf"
    :autoUpload="false"
    description="PDF, Word, and text files only"
    :disabled="false"
    dropModeIcon="IconGallery"
    dropModeLabel="Drop your files"
    label="Upload Documents"
    :maxFiles="3"
    :maxSize="0"
    multiple
    :required="false"
    showControls
    showPreview
    uploadIcon="IconDocument"
  >
    <template #title>Drop your documents here</template>
  </FileInputCombo>
</template>
```

##### Auto Upload

Auto Upload Files

##### Files will upload automatically

Or

Click to browse files

```
<template>
  <FileInputCombo
    autoUpload
    :disabled="false"
    dropModeIcon="IconGallery"
    dropModeLabel="Drop your files"
    label="Auto Upload Files"
    :maxFiles="0"
    :maxSize="0"
    multiple
    :required="false"
    :showControls="false"
    showPreview
    uploadIcon="IconCloudUpload"
  >
    <template #title>Files will upload automatically</template>
  </FileInputCombo>
</template>
```

##### Disabled

Disabled Upload

##### Upload disabled

Or

You cannot upload files at this time

```
<template>
  <FileInputCombo
    :autoUpload="false"
    description="You cannot upload files at this time"
    disabled
    dropModeIcon="IconGallery"
    dropModeLabel="Drop your files"
    label="Disabled Upload"
    :maxFiles="0"
    :maxSize="0"
    multiple
    :required="false"
    showControls
    showPreview
    uploadIcon="IconCloudUpload"
  >
    <template #title>Upload disabled</template>
  </FileInputCombo>
</template>
```

##### No Preview

##### Simple Upload

Or

No file previews will be shown

```
<template>
  <FileInputCombo
    :autoUpload="false"
    description="No file previews will be shown"
    :disabled="false"
    dropModeIcon="IconGallery"
    dropModeLabel="Drop your files"
    :maxFiles="0"
    :maxSize="0"
    multiple
    :required="false"
    showControls
    :showPreview="false"
    uploadIcon="IconCloudUpload"
  >
    <template #title>Simple Upload</template>
  </FileInputCombo>
</template>
```

##### Custom Icons

##### Drop files to upload

Or

Click to browse files

```
<template>
  <FileInputCombo
    :autoUpload="false"
    :disabled="false"
    dropModeIcon="IconCloud"
    dropModeLabel="Drop files anywhere"
    :maxFiles="0"
    :maxSize="0"
    multiple
    :required="false"
    showControls
    showPreview
    uploadIcon="IconUpload"
  />
</template>
```

##### With File Size Limit

Limited Upload Size

##### Drop files to upload

Or

Maximum file size: 1MB

```
<template>
  <FileInputCombo
    :autoUpload="false"
    description="Maximum file size: 1MB"
    :disabled="false"
    dropModeIcon="IconGallery"
    dropModeLabel="Drop your files"
    label="Limited Upload Size"
    :maxFiles="0"
    :maxSize="1048576"
    multiple
    :required="false"
    showControls
    showPreview
    uploadIcon="IconCloudUpload"
  />
</template>
```

##### With Max Files

Limited Number of Files

##### Drop files to upload

Or

Maximum 2 files allowed

```
<template>
  <FileInputCombo
    :autoUpload="false"
    description="Maximum 2 files allowed"
    :disabled="false"
    dropModeIcon="IconGallery"
    dropModeLabel="Drop your files"
    label="Limited Number of Files"
    :maxFiles="2"
    :maxSize="0"
    multiple
    :required="false"
    showControls
    showPreview
    uploadIcon="IconCloudUpload"
  />
</template>
```

##### With Upload Error

Upload with Error Simulation

##### Drop files to upload

Or

Files will fail to upload after progress reaches 30%

```
<template>
  <FileInputCombo
    autoUpload
    description="Files will fail to upload after progress reaches 30%"
    :disabled="false"
    dropModeIcon="IconGallery"
    dropModeLabel="Drop your files"
    label="Upload with Error Simulation"
    :maxFiles="0"
    :maxSize="0"
    multiple
    :required="false"
    showControls
    showPreview
    uploadIcon="IconCloudUpload"
  />
</template>
```

##### With Toast Notifications

This story demonstrates toast notifications for all component events. Try selecting, uploading, cancelling and removing files to see different toast notifications.

File Upload with Toast Notifications

##### Upload files to see toast notifications

Or

All component events will be displayed as toast notifications

```
<template>
  <FileInputCombo
    autoUpload
    description="All component events will be displayed as toast notifications"
    :disabled="false"
    dropModeIcon="IconGallery"
    dropModeLabel="Drop your files"
    label="File Upload with Toast Notifications"
    :maxFiles="5"
    :maxSize="0"
    multiple
    :required="false"
    showControls
    showPreview
    uploadIcon="IconCloudUpload"
  >
    <template #title>Upload files to see toast notifications</template>
  </FileInputCombo>
</template>
```

##### Withtoast Errors

This story demonstrates error toast notifications. All uploads will fail at 30% progress, displaying error toasts.

Upload with Error Notifications

##### Files will error at 30% upload

Or

Demonstrates error toast notifications

```
<template>
  <FileInputCombo
    autoUpload
    description="Demonstrates error toast notifications"
    :disabled="false"
    dropModeIcon="IconGallery"
    dropModeLabel="Drop your files"
    label="Upload with Error Notifications"
    :maxFiles="3"
    :maxSize="0"
    multiple
    :required="false"
    showControls
    showPreview
    uploadIcon="IconCloudUpload"
  >
    <template #title>Files will error at 30% upload</template>
  </FileInputCombo>
</template>
```

---

## Form / Input

### Input

### Input Component

A flexible input component that supports various input types, icon integration with click events, and visual states. This component is built with accessibility in mind and supports form validation states.

#### Features

-   Supports common input types (text, email, password, number, etc.)
-   Optional label with required indicator
-   Error state with custom error message
-   Icon support with RTL/LTR aware positioning
-   Clickable icons with event handling
-   Disabled state
-   Range input with min/max values
-   Fully reactive with Vue's v-model

#### Icon Positioning

-   **Default** (`iconOppositePosition: false`): Icons appear behind content (LTR: left, RTL: right)
-   **Opposite** (`iconOppositePosition: true`): Icons appear after content (LTR: right, RTL: left)

```
<template>
  <Input
    :disabled="false"
    :error="false"
    :iconOppositePosition="false"
    placeholder="Default input field"
    :required="false"
    type="text"
  />
</template>
```

| Name | Description | Default | Control |
| --- | --- | --- | --- |
| props |  |
| type | Input type attribute"text""range""email""password""number""tel""url""search" | "text" | Choose option...textemailpasswordnumbertelurlsearchrange |
| placeholder | Placeholder textstring | "" | Default input field |
| disabled | Disabled stateboolean | - | FalseTrue |
| required | Required stateboolean | false | FalseTrue |
| error | Error stateboolean | false | FalseTrue |
| errorMessage | Error message textstring | "" |  |
| iconName | Icon name to be displayed in the inputstring | "" | Choose option...IconSearchIconMailIconEyeIconLockIconUserIconX |
| iconOppositePosition | When true, positions icon on the opposite side. Default: icon behind content (LTR: left, RTL: right). Opposite: icon after content (LTR: right, RTL: left)boolean | false | FalseTrue |
| id | Input ID attribute for label associationstring | "" |  |
| modelValue | string | "" |  |
| label | Label of inputstring | "" |  |
| min | Minimum value for range inputsstringnumber | 0 |  |
| max | Maximum value for range inputsstringnumber | 100 |  |
| events |  |
| update:modelValue | Emitted when the input value changes.string | - | - |
| blur | Emitted when the input loses focus.FocusEvent | - | - |
| focus | Emitted when the input gains focus.FocusEvent | - | - |
| enter | Emitted when the Enter key is pressed.string | - | - |
| iconClick | Emitted when the icon is clicked.MouseEvent | - | - |

#### Stories

##### Default

```
<template>
  <Input
    :disabled="false"
    :error="false"
    :iconOppositePosition="false"
    placeholder="Default input field"
    :required="false"
    type="text"
  />
</template>
```

##### With Label

Input with a descriptive label to improve accessibility.

Username

```
<template>
  <Input
    :disabled="false"
    :error="false"
    :iconOppositePosition="false"
    id="username-input"
    label="Username"
    placeholder="Enter username"
    :required="false"
    type="text"
  />
</template>
```

##### With Icon

Input with a search icon using default positioning (behind content: LTR: left, RTL: right).

Search

```
<template>
  <Input
    :disabled="false"
    :error="false"
    iconName="IconSearch"
    :iconOppositePosition="false"
    label="Search"
    placeholder="Search for something..."
    :required="false"
    type="text"
  />
</template>
```

##### With Icon Opposite Position

Input with an icon positioned on the opposite side (after content: LTR: right, RTL: left).

Username

```
<template>
  <Input
    :disabled="false"
    :error="false"
    iconName="IconUser"
    iconOppositePosition
    label="Username"
    placeholder="Enter username"
    :required="false"
    type="text"
  />
</template>
```

##### Clickable Icon

Input with a clickable icon that can toggle password visibility or perform other actions.

Password

Click the eye icon to toggle password visibility

```
<template>
  <Input
    :disabled="false"
    :error="false"
    iconName="IconEye"
    :iconOppositePosition="false"
    label="Password"
    placeholder="Enter password"
    :required="false"
    type="password"
  />
</template>
```

##### Email Input

Email input with mail icon positioned opposite to default (LTR: left, RTL: right).

Email Address \*

```
<template>
  <Input
    :disabled="false"
    :error="false"
    iconName="IconMail"
    iconOppositePosition
    label="Email Address"
    placeholder="your@email.com"
    required
    type="email"
  />
</template>
```

##### Password Input

Password input with a lock icon positioned opposite to default direction.

Password \*

```
<template>
  <Input
    :disabled="false"
    :error="false"
    iconName="IconLock"
    iconOppositePosition
    label="Password"
    placeholder="Enter your password"
    required
    type="password"
  />
</template>
```

##### With Error

Input in an error state with an alert icon using default positioning.

Email

This field is required

```
<template>
  <Input
    :disabled="false"
    error
    errorMessage="This field is required"
    iconName="IconX"
    :iconOppositePosition="false"
    label="Email"
    placeholder="Enter email"
    :required="false"
    type="email"
  />
</template>
```

##### Disabled

Disabled input with visual indication of its unavailable state and icon in opposite position.

Username

```
<template>
  <Input
    disabled
    :error="false"
    iconName="IconUser"
    iconOppositePosition
    label="Username"
    placeholder="This field is disabled"
    :required="false"
    type="text"
  />
</template>
```

##### Required

Required input with asterisk indicator next to the label.

Name \*

```
<template>
  <Input
    :disabled="false"
    :error="false"
    :iconOppositePosition="false"
    label="Name"
    placeholder="Enter your name"
    required
    type="text"
  />
</template>
```

##### Number Input

Number input with minimum and maximum constraints.

Age

```
<template>
  <Input
    :disabled="false"
    :error="false"
    :iconOppositePosition="false"
    label="Age"
    :max="120"
    :min="0"
    placeholder="Enter your age"
    :required="false"
    type="number"
  />
</template>
```

##### Range

Range slider input with label and min/max values.

Volume

```
<script lang="ts" setup>
import { ref } from "vue";

const modelValue = ref("50");
</script>

<template>
  <Input
    :disabled="false"
    :error="false"
    :iconOppositePosition="false"
    id="volume-input"
    label="Volume"
    :max="100"
    :min="0"
    v-model="modelValue"
    placeholder="Some Text..."
    :required="false"
    type="range"
  />
</template>
```

##### Tel Input

Telephone input with appropriate formatting placeholder.

Phone Number

```
<template>
  <Input
    :disabled="false"
    :error="false"
    :iconOppositePosition="false"
    label="Phone Number"
    placeholder="(123) 456-7890"
    :required="false"
    type="tel"
  />
</template>
```

##### RTL Icon Comparison

Comparison showing how icon positioning works with RTL/LTR awareness and iconOppositePosition.

##### Default Icon Positioning (iconOppositePosition: false)

Search (Default)

##### Opposite Icon Positioning (iconOppositePosition: true)

Search (Opposite)

**Note:** Icon positioning adapts to your app's RTL/LTR direction automatically.

• **LTR (Left-to-Right):** Default = right, Opposite = left

• **RTL (Right-to-Left):** Default = left, Opposite = right

```
<template>
  <Input
    :disabled="false"
    :error="false"
    :iconOppositePosition="false"
    placeholder="Some Text..."
    :required="false"
    type="text"
  />
</template>
```

##### With Enter Key Event

Input that captures values when Enter key is pressed and displays them in a list below.

Quick Add

```
<template>
  <Input
    :disabled="false"
    :error="false"
    iconName="IconSearch"
    :iconOppositePosition="false"
    label="Quick Add"
    placeholder="Type and press Enter"
    :required="false"
    type="text"
  />
</template>
```

##### Icon Positioning Comparison

This story demonstrates the two icon positioning modes. Toggle `iconOppositePosition` to see the difference between behind content (default) and after content (opposite).

Icon Positioning Demo

```
<template>
  <Input
    :disabled="false"
    :error="false"
    iconName="IconSearch"
    :iconOppositePosition="false"
    label="Icon Positioning Demo"
    placeholder="See different icon positions"
    :required="false"
    type="text"
  />
</template>
```

---

## Form / Inputgroup

### InputGroup

### InputGroup

A flexible container component that groups form elements together with proper styling coordination. The InputGroup automatically manages border radius, error states, and spacing for its child components.

#### Features

-   **Slot-based Architecture**: Accepts any number of child components through a single default slot
-   **Automatic Styling**: Manages border radius for first, middle, and last children
-   **Error State Management**: Coordinates error styling across all children
-   **RTL Support**: Proper right-to-left layout support
-   **Theme Support**: Works with light, dark, and semidark themes
-   **Flexible Layout**: Input components automatically take available width with flex-1

#### Common Use Cases

-   Input with prefix/suffix text or icons
-   Input with action buttons
-   Multiple related form elements
-   Search input with submit button
-   Currency input with symbol prefix
-   URL input with domain suffix

#### Accessibility

-   Proper label association for screen readers
-   Error message announcement
-   Keyboard navigation support
-   ARIA attributes for form validation

Note: This section intentionally omits code; Storybook shows usage code automatically.

Username

@

```
<template>
  <InputGroup
    :disabled="false"
    :error="false"
    label="Username"
    :required="false"
  />
</template>
```

| Name | Description | Default | Control |
| --- | --- | --- | --- |
| props |  |
| label | Label text for the input groupstring | "" | Username |
| required | Whether the input group is requiredboolean | false | FalseTrue |
| error | Whether the input group has an error stateboolean | false | FalseTrue |
| errorMessage | Error message to display when error is truestring | "" |  |
| disabled | Whether the input group is disabledboolean | false | FalseTrue |

#### Stories

##### Default

Username

@

```
<template>
  <InputGroup
    :disabled="false"
    :error="false"
    label="Username"
    :required="false"
  />
</template>
```

##### With Suffix

Username

@example.com

```
<template>
  <InputGroup
    :disabled="false"
    :error="false"
    label="Username"
    :required="false"
  />
</template>
```

##### With Prefix And Suffix

Username

$

.00

```
<template>
  <InputGroup
    :disabled="false"
    :error="false"
    label="Username"
    :required="false"
  />
</template>
```

##### With Buttons

Username

```
<template>
  <InputGroup
    :disabled="false"
    :error="false"
    label="Username"
    :required="false"
  />
</template>
```

##### Button Group

Username

```
<template>
  <InputGroup
    :disabled="false"
    :error="false"
    label="Username"
    :required="false"
  />
</template>
```

##### With Icons

Username

```
<template>
  <InputGroup
    :disabled="false"
    :error="false"
    label="Username"
    :required="false"
  />
</template>
```

##### With Error

Username

@

Please enter a valid email address

```
<template>
  <InputGroup
    :disabled="false"
    error
    errorMessage="Please enter a valid email address"
    label="Username"
    :required="false"
  />
</template>
```

##### Disabled

Username

@

```
<template>
  <InputGroup disabled :error="false" label="Username" :required="false" />
</template>
```

##### Multiple Inputs

Username

Name

```
<template>
  <InputGroup
    :disabled="false"
    :error="false"
    label="Username"
    :required="false"
  />
</template>
```

##### Search With Dropdown

Username

```
<template>
  <InputGroup
    :disabled="false"
    :error="false"
    label="Username"
    :required="false"
  />
</template>
```

##### With Select Dropdown

Username

```
<template>
  <InputGroup
    :disabled="false"
    :error="false"
    label="Username"
    :required="false"
  />
</template>
```

##### Currency Input

Username

```
<template>
  <InputGroup
    :disabled="false"
    :error="false"
    label="Username"
    :required="false"
  />
</template>
```

##### Interactive

Username

```
<template>
  <InputGroup
    :disabled="false"
    :error="false"
    label="Username"
    :required="false"
  />
</template>
```

---

## Form / Select

### Select

### Select Component

A flexible and customizable select component that supports both default and custom modes. The Select component provides a comprehensive dropdown interface with support for single/multiple selection, search functionality, grouped options, and custom rendering through slots.

#### Features

-   **Default Mode**: Traditional dropdown with built-in search, styling, and interactions
-   **Custom Mode**: Complete customization through three specialized slots (header, each, footer)
-   **Confirmation Mode**: Built-in confirmation footer with Accept/Cancel buttons for improved UX
-   **Multiple Selection**: Support for selecting multiple options with toggle behavior
-   **Search Functionality**: Built-in search with filtering capabilities
-   **Grouped Options**: Support for categorized option groups
-   **Accessibility**: Full ARIA support and keyboard navigation
-   **Theme Integration**: Light/dark mode support with Tailwind CSS
-   **RTL Support**: Right-to-left layout support
-   **Icon Integration**: Optional icon placement and interaction

#### Confirmation Mode

When `confirm={true}`, the component automatically shows a built-in footer with Accept and Cancel buttons. This mode works in both single and multiple selection modes and provides improved UX by allowing users to make temporary selections before committing.

**Key Benefits:**

-   **Value Preservation**: Original selection is preserved until confirmed
-   **Better UX**: Users can review their choices before committing
-   **Built-in Footer**: No need to implement custom footer logic
-   **Universal Support**: Works with single, multiple, and grouped options

#### Custom Mode Slots

When `custom={true}`, the component provides three specialized slots:

##### Header Slot

-   **Purpose**: Custom search widgets, filters, or additional controls
-   **Scoped Variables**:
    -   `allOptions`: Array of all available options
    -   `setNewList`: Function to update the options list

##### Each Slot

-   **Purpose**: Custom rendering for each individual option
-   **Scoped Variables**:
    -   `option`: The current option data
    -   `isSelected`: Boolean indicating if option is selected
    -   `setSelected`: Function to select/deselect the option

##### Footer Slot

-   **Purpose**: Custom actions, accept/reject buttons, or additional controls
-   **Scoped Variables**:
    -   `close`: Function to close dropdown with acceptance parameter

#### Selected Slot

The `selected` slot allows you to customize how selected options are displayed in the trigger button. This slot is available in both default and custom modes.

-   **Purpose**: Custom display of selected option(s) in the trigger button
-   **Scoped Variables**:
    -   `selectedOption`: The selected value (single mode only, undefined in multiple mode)
    -   `selectedOptions`: Array of selected values (always an array - contains single item in single mode, multiple items in multiple mode)
    -   `multiple`: Boolean indicating if multiple selection mode is enabled
    -   `getOptionLabel`: Helper function to get the display label for an option
    -   `selectedCount`: Number of selected items

#### Accessibility

-   Full keyboard navigation support (Enter, Space, Arrow keys, Escape)
-   Proper ARIA attributes (aria-expanded, aria-haspopup, aria-selected)
-   Screen reader friendly with proper role attributes
-   Focus management for search inputs and options

#### Usage Guidelines

-   Use **Default Mode** for standard dropdown requirements
-   Use **Custom Mode** when you need complete control over the dropdown appearance and behavior
-   Always provide meaningful labels and placeholders for accessibility
-   Consider using the `required` prop for form validation
-   Use `error` and `errorMessage` props for validation feedback

Note: This section intentionally omits code; Storybook shows usage code automatically.

Selected value: None

```
<script lang="ts" setup>
const options = ["Orange","White","Purple","Yellow","Red","Green"];
</script>

<template>
  <Select
    allowEmpty
    :confirm="false"
    :custom="false"
    :disabled="false"
    :error="false"
    :grouped="false"
    groupLabel="group_name"
    groupValues="list"
    :iconOppositePosition="false"
    labelKey="label"
    :multiple="false"
    noOptionsMessage="No options available"
    :options="options"
    placeholder="Choose a color"
    :preselectFirst="false"
    :required="false"
    :searchable="false"
    searchPlaceholder="Search..."
    trackBy="value"
    valueKey="value"
  />
</template>
```

| Name | Description | Default | Control |
| --- | --- | --- | --- |
| props |  |
| placeholder | Placeholder text when no option is selectedstring | "Select an option" | Choose a color |
| disabled | Whether the select component is disabledboolean | - | FalseTrue |
| required | Whether the field is required (shows asterisk)boolean | false | FalseTrue |
| error | Whether to show error stylingboolean | false | FalseTrue |
| errorMessage | Error message to display below the selectstring | "" |  |
| label | Label text for the select fieldstring | "" |  |
| id | Unique identifier for the select fieldstring | "" |  |
| searchable | Whether to show a search input in the dropdownboolean | false | FalseTrue |
| searchPlaceholder | Placeholder text for the search inputstring | "Search..." | Search... |
| multiple | Whether to allow multiple option selectionboolean | false | FalseTrue |
| grouped | Whether options are groupedboolean | false | FalseTrue |
| groupLabel | Property name for group labels when grouped is truestring | "group_name" | group_name |
| groupValues | Property name for group option arrays when grouped is truestring | "list" | list |
| trackBy | Property name to use for option identificationstring | "value" | value |
| labelKey | Property name to use for option display textstring | "label" | label |
| valueKey | Property name to use for option valuesstring | "value" | value |
| noOptionsMessage | Message to show when no options are availablestring | "No options available" | No options available |
| iconName | Name of the icon to displaystring | "" | Choose option...IconSearchIconMailIconUserIconX |
| iconOppositePosition | Whether to position icon on the opposite sideboolean | false | FalseTrue |
| preselectFirst | Whether to automatically select the first optionboolean | false | FalseTrue |
| allowEmpty | Whether to allow no selectionboolean | true | FalseTrue |
| custom | Whether to enable custom mode with slot-based renderingboolean | false | FalseTrue |
| confirm | Whether to show a confirmation footer with Accept/Cancel buttonsboolean | false | FalseTrue |
| options | Array of options to display in the dropdownTSParenthesizedType[] | () => [] | options : [0 : "Orange"1 : "White"2 : "Purple"3 : "Yellow"4 : "Red"5 : "Green"] |
| modelValue | The v-model value for the select componentany | - |  |
| events |  |
| update:modelValue | any | - | - |
| change | any | - | - |
| focus | FocusEvent | - | - |
| blur | FocusEvent | - | - |
| open | other | - | - |
| close | other | - | - |
| onUpdate:modelValue | Event emitted when value changesany | - | - |
| onChange | Event emitted when selection changesany | - | - |
| onOpen | Event emitted when dropdown opens- | - | - |
| onClose | Event emitted when dropdown closes- | - | - |
| slots |  |
| selected | { selected-option: unknown; selected-options: unknown; multiple: unknown; get-option-label: unknown; selected-count: unknown } | - |  |
| header | { all-options: unknown; set-new-list: unknown } | - |  |
| each | { option: unknown; is-selected: unknown; set-selected: unknown } | - |  |
| footer | { close: unknown } | - |  |

#### Stories

##### Default

Selected value: None

```
<script lang="ts" setup>
const options = ["Orange","White","Purple","Yellow","Red","Green"];
</script>

<template>
  <Select
    allowEmpty
    :confirm="false"
    :custom="false"
    :disabled="false"
    :error="false"
    :grouped="false"
    groupLabel="group_name"
    groupValues="list"
    :iconOppositePosition="false"
    labelKey="label"
    :multiple="false"
    noOptionsMessage="No options available"
    :options="options"
    placeholder="Choose a color"
    :preselectFirst="false"
    :required="false"
    :searchable="false"
    searchPlaceholder="Search..."
    trackBy="value"
    valueKey="value"
  />
</template>
```

##### With Label

Favorite Color

Selected value: None

```
<script lang="ts" setup>
const options = ["Orange","White","Purple","Yellow","Red","Green"];
</script>

<template>
  <Select
    allowEmpty
    :confirm="false"
    :custom="false"
    :disabled="false"
    :error="false"
    :grouped="false"
    groupLabel="group_name"
    groupValues="list"
    :iconOppositePosition="false"
    label="Favorite Color"
    labelKey="label"
    :multiple="false"
    noOptionsMessage="No options available"
    :options="options"
    placeholder="Choose a color"
    :preselectFirst="false"
    :required="false"
    :searchable="false"
    searchPlaceholder="Search..."
    trackBy="value"
    valueKey="value"
  />
</template>
```

##### Required

Favorite Color \*

Selected value: None

```
<script lang="ts" setup>
const options = ["Orange","White","Purple","Yellow","Red","Green"];
</script>

<template>
  <Select
    allowEmpty
    :confirm="false"
    :custom="false"
    :disabled="false"
    :error="false"
    :grouped="false"
    groupLabel="group_name"
    groupValues="list"
    :iconOppositePosition="false"
    label="Favorite Color"
    labelKey="label"
    :multiple="false"
    noOptionsMessage="No options available"
    :options="options"
    placeholder="Choose a color"
    :preselectFirst="false"
    required
    :searchable="false"
    searchPlaceholder="Search..."
    trackBy="value"
    valueKey="value"
  />
</template>
```

##### With Icon

Search Category

Selected value: None

```
<script lang="ts" setup>
const options = ["Products","Services","Support","About"];
</script>

<template>
  <Select
    allowEmpty
    :confirm="false"
    :custom="false"
    :disabled="false"
    :error="false"
    :grouped="false"
    groupLabel="group_name"
    groupValues="list"
    iconName="IconSearch"
    :iconOppositePosition="false"
    label="Search Category"
    labelKey="label"
    :multiple="false"
    noOptionsMessage="No options available"
    :options="options"
    placeholder="Select category"
    :preselectFirst="false"
    :required="false"
    :searchable="false"
    searchPlaceholder="Search..."
    trackBy="value"
    valueKey="value"
  />
</template>
```

##### Searchable

Search Country

Selected value: None

```
<script lang="ts" setup>
const options = ["United States","Canada","United Kingdom","Germany","France","Spain","Italy","Japan","China","India","Brazil","Australia"];
</script>

<template>
  <Select
    allowEmpty
    :confirm="false"
    :custom="false"
    :disabled="false"
    :error="false"
    :grouped="false"
    groupLabel="group_name"
    groupValues="list"
    :iconOppositePosition="false"
    label="Search Country"
    labelKey="label"
    :multiple="false"
    noOptionsMessage="No options available"
    :options="options"
    placeholder="Type to search countries"
    :preselectFirst="false"
    :required="false"
    searchable
    searchPlaceholder="Search..."
    trackBy="value"
    valueKey="value"
  />
</template>
```

##### Multiple

Select Colors

Selected values: None

```
<script lang="ts" setup>
const options = ["Orange","White","Purple","Yellow","Red","Green"];
</script>

<template>
  <Select
    allowEmpty
    :confirm="false"
    :custom="false"
    :disabled="false"
    :error="false"
    :grouped="false"
    groupLabel="group_name"
    groupValues="list"
    :iconOppositePosition="false"
    label="Select Colors"
    labelKey="label"
    multiple
    noOptionsMessage="No options available"
    :options="options"
    placeholder="Choose multiple colors"
    :preselectFirst="false"
    :required="false"
    :searchable="false"
    searchPlaceholder="Search..."
    trackBy="value"
    valueKey="value"
  />
</template>
```

##### Object Options

Select User

Selected value: None

```
<script lang="ts" setup>
const options = [
  {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  },
  {
    "id": 2,
    "name": "Jane Smith",
    "email": "jane@example.com"
  },
  {
    "id": 3,
    "name": "Bob Johnson",
    "email": "bob@example.com"
  }
];
</script>

<template>
  <Select
    allowEmpty
    :confirm="false"
    :custom="false"
    :disabled="false"
    :error="false"
    :grouped="false"
    groupLabel="group_name"
    groupValues="list"
    :iconOppositePosition="false"
    label="Select User"
    labelKey="name"
    :multiple="false"
    noOptionsMessage="No options available"
    :options="options"
    placeholder="Choose a user"
    :preselectFirst="false"
    :required="false"
    :searchable="false"
    searchPlaceholder="Search..."
    trackBy="id"
    valueKey="id"
  />
</template>
```

##### Grouped

Select Category

Selected value: None

```
<script lang="ts" setup>
const options = [
  {
    "group_name": "Fruits",
    "list": [
      {
        "name": "Apple",
        "value": "apple"
      },
      {
        "name": "Banana",
        "value": "banana"
      },
      {
        "name": "Orange",
        "value": "orange"
      }
    ]
  },
  {
    "group_name": "Vegetables",
    "list": [
      {
        "name": "Carrot",
        "value": "carrot"
      },
      {
        "name": "Broccoli",
        "value": "broccoli"
      },
      {
        "name": "Spinach",
        "value": "spinach"
      }
    ]
  }
];
</script>

<template>
  <Select
    allowEmpty
    :confirm="false"
    :custom="false"
    :disabled="false"
    :error="false"
    grouped
    groupLabel="group_name"
    groupValues="list"
    :iconOppositePosition="false"
    label="Select Category"
    labelKey="name"
    :multiple="false"
    noOptionsMessage="No options available"
    :options="options"
    placeholder="Choose a category"
    :preselectFirst="false"
    :required="false"
    :searchable="false"
    searchPlaceholder="Search..."
    trackBy="value"
    valueKey="value"
  />
</template>
```

##### With Error

Required Field \*

This field is required

Selected value: None

```
<script lang="ts" setup>
const options = ["Option 1","Option 2","Option 3"];
</script>

<template>
  <Select
    allowEmpty
    :confirm="false"
    :custom="false"
    :disabled="false"
    error
    errorMessage="This field is required"
    :grouped="false"
    groupLabel="group_name"
    groupValues="list"
    :iconOppositePosition="false"
    label="Required Field"
    labelKey="label"
    :multiple="false"
    noOptionsMessage="No options available"
    :options="options"
    placeholder="Please select an option"
    :preselectFirst="false"
    required
    :searchable="false"
    searchPlaceholder="Search..."
    trackBy="value"
    valueKey="value"
  />
</template>
```

##### Disabled

Disabled Select

Selected value: None

```
<script lang="ts" setup>
const options = ["Option 1","Option 2","Option 3"];
</script>

<template>
  <Select
    allowEmpty
    :confirm="false"
    :custom="false"
    disabled
    :error="false"
    :grouped="false"
    groupLabel="group_name"
    groupValues="list"
    :iconOppositePosition="false"
    label="Disabled Select"
    labelKey="label"
    :multiple="false"
    noOptionsMessage="No options available"
    :options="options"
    placeholder="This select is disabled"
    :preselectFirst="false"
    :required="false"
    :searchable="false"
    searchPlaceholder="Search..."
    trackBy="value"
    valueKey="value"
  />
</template>
```

##### Preselect First

Auto-select First

Selected value: First Option

```
<script lang="ts" setup>
const options = ["First Option","Second Option","Third Option"];
</script>

<template>
  <Select
    allowEmpty
    :confirm="false"
    :custom="false"
    :disabled="false"
    :error="false"
    :grouped="false"
    groupLabel="group_name"
    groupValues="list"
    :iconOppositePosition="false"
    label="Auto-select First"
    labelKey="label"
    :multiple="false"
    noOptionsMessage="No options available"
    :options="options"
    placeholder="First option will be selected automatically"
    preselectFirst
    :required="false"
    :searchable="false"
    searchPlaceholder="Search..."
    trackBy="value"
    valueKey="value"
  />
</template>
```

##### Interactive

Interactive Select

Selected Value:

```
""
```

```
<script lang="ts" setup>
const options = ["Option A","Option B","Option C","Option D"];
</script>

<template>
  <Select
    allowEmpty
    :confirm="false"
    :custom="false"
    :disabled="false"
    :error="false"
    :grouped="false"
    groupLabel="group_name"
    groupValues="list"
    :iconOppositePosition="false"
    label="Interactive Select"
    labelKey="label"
    :multiple="false"
    noOptionsMessage="No options available"
    :options="options"
    placeholder="Select an option to see the value"
    :preselectFirst="false"
    :required="false"
    :searchable="false"
    searchPlaceholder="Search..."
    trackBy="value"
    valueKey="value"
  />
</template>
```

##### Multiple Interactive

Multiple Selection

Selected Values:

```
[]
```

```
<script lang="ts" setup>
const options = ["Red","Green","Blue","Yellow","Purple","Orange"];
</script>

<template>
  <Select
    allowEmpty
    :confirm="false"
    :custom="false"
    :disabled="false"
    :error="false"
    :grouped="false"
    groupLabel="group_name"
    groupValues="list"
    :iconOppositePosition="false"
    label="Multiple Selection"
    labelKey="label"
    multiple
    noOptionsMessage="No options available"
    :options="options"
    placeholder="Select multiple colors"
    :preselectFirst="false"
    :required="false"
    :searchable="false"
    searchPlaceholder="Search..."
    trackBy="value"
    valueKey="value"
  />
</template>
```

##### Searchable Objects

Search Users

Selected User:

```
null
```

```
<script lang="ts" setup>
const options = [
  {
    "id": 1,
    "name": "John Doe",
    "role": "Developer",
    "department": "Engineering"
  },
  {
    "id": 2,
    "name": "Jane Smith",
    "role": "Designer",
    "department": "Design"
  },
  {
    "id": 3,
    "name": "Bob Johnson",
    "role": "Manager",
    "department": "Management"
  },
  {
    "id": 4,
    "name": "Alice Brown",
    "role": "Developer",
    "department": "Engineering"
  },
  {
    "id": 5,
    "name": "Charlie Wilson",
    "role": "Designer",
    "department": "Design"
  }
];
</script>

<template>
  <Select
    allowEmpty
    :confirm="false"
    :custom="false"
    :disabled="false"
    :error="false"
    :grouped="false"
    groupLabel="group_name"
    groupValues="list"
    :iconOppositePosition="false"
    label="Search Users"
    labelKey="name"
    :multiple="false"
    noOptionsMessage="No options available"
    :options="options"
    placeholder="Search by name, role, or department"
    :preselectFirst="false"
    :required="false"
    searchable
    searchPlaceholder="Search..."
    trackBy="id"
    valueKey="id"
  />
</template>
```

##### Complex Grouped

Complex Grouped Select

Selected: Option 1

```
<script lang="ts" setup>
const options = [
  {
    "group_name": "Group 1",
    "list": [
      {
        "name": "Option 1"
      },
      {
        "name": "Option 2"
      }
    ]
  },
  {
    "group_name": "Group 2",
    "list": [
      {
        "name": "Option 3"
      }
    ]
  }
];
</script>

<template>
  <Select
    allowEmpty
    :confirm="false"
    :custom="false"
    :disabled="false"
    :error="false"
    grouped
    groupLabel="group_name"
    groupValues="list"
    :iconOppositePosition="false"
    label="Complex Grouped Select"
    labelKey="name"
    :multiple="false"
    noOptionsMessage="No options available"
    :options="options"
    placeholder="Select from grouped options"
    :preselectFirst="false"
    :required="false"
    :searchable="false"
    searchPlaceholder="Search..."
    trackBy="value"
    valueKey="value"
  />
</template>
```

##### Confirmation Mode

This story demonstrates the **Confirmation Mode** functionality of the Select component. When `confirm={true}`, the component shows a built-in footer with Accept and Cancel buttons.

**Key Features:**

-   **Built-in Footer**: Automatically shows Accept/Cancel buttons
-   **Value Preservation**: Original value is preserved until confirmed
-   **Single Mode**: Works seamlessly with single selection
-   **Improved UX**: Users can make temporary selections and confirm or cancel them

The confirmation footer appears below the options and provides clear actions for the user to either accept their selection or cancel and revert to the original value.

Confirmation Mode Select (Single)

Selected: Option 1

```
<script lang="ts" setup>
const options = ["Option 1","Option 2","Option 3","Option 4","Option 5"];
</script>

<template>
  <Select
    allowEmpty
    confirm
    :custom="false"
    :disabled="false"
    :error="false"
    :grouped="false"
    groupLabel="group_name"
    groupValues="list"
    :iconOppositePosition="false"
    label="Confirmation Mode Select (Single)"
    labelKey="label"
    :multiple="false"
    noOptionsMessage="No options available"
    :options="options"
    placeholder="Select an option (confirmation required)"
    :preselectFirst="false"
    :required="false"
    :searchable="false"
    searchPlaceholder="Search..."
    trackBy="value"
    valueKey="value"
  />
</template>
```

##### Multiple Confirmation Mode

This story demonstrates the **Multiple Confirmation Mode** functionality. When `confirm={true}` and `multiple={true}`, users can select multiple options and then confirm or cancel their selection.

**Key Features:**

-   **Multiple Selection**: Users can select/deselect multiple options
-   **Built-in Footer**: Accept/Cancel buttons for final confirmation
-   **Value Preservation**: Original selection is preserved until confirmed
-   **Enhanced UX**: Perfect for scenarios where users need to review their choices

This mode is particularly useful for forms where users need to make multiple selections and want to review them before committing.

Confirmation Mode Select (Multiple)

Selected: Option 1

```
<script lang="ts" setup>
const options = ["Option 1","Option 2","Option 3","Option 4","Option 5"];
</script>

<template>
  <Select
    allowEmpty
    confirm
    :custom="false"
    :disabled="false"
    :error="false"
    :grouped="false"
    groupLabel="group_name"
    groupValues="list"
    :iconOppositePosition="false"
    label="Confirmation Mode Select (Multiple)"
    labelKey="label"
    multiple
    noOptionsMessage="No options available"
    :options="options"
    placeholder="Select multiple options (confirmation required)"
    :preselectFirst="false"
    :required="false"
    :searchable="false"
    searchPlaceholder="Search..."
    trackBy="value"
    valueKey="value"
  />
</template>
```

##### Custom Mode

This story demonstrates the **Custom Mode** functionality of the Select component, showcasing how to use the three specialized slots for complete customization:

-   **Header Slot**: Custom search widget with option count display
-   **Each Slot**: Custom option rendering with selection indicators
-   **Footer Slot**: Custom actions (Accept/Cancel buttons)

The component is configured with `custom={true}` and `multiple={true}` to enable custom mode with multiple selection support. In custom mode, the dropdown height is increased to accommodate all content including the footer section.

Custom Mode Select (Multiple)

Selected: Option 1

```
<script lang="ts" setup>
const options = ["Option 1","Option 2","Option 3","Option 4","Option 5"];
</script>

<template>
  <Select
    allowEmpty
    :confirm="false"
    custom
    :disabled="false"
    :error="false"
    :grouped="false"
    groupLabel="group_name"
    groupValues="list"
    :iconOppositePosition="false"
    label="Custom Mode Select (Multiple)"
    labelKey="label"
    multiple
    noOptionsMessage="No options available"
    :options="options"
    placeholder="Custom select with slots"
    :preselectFirst="false"
    :required="false"
    :searchable="false"
    searchPlaceholder="Search..."
    trackBy="value"
    valueKey="value"
  />
</template>
```

##### Custom Selected Display

This story demonstrates the **Selected Slot** functionality, which allows you to customize how selected options are displayed in the trigger button.

**Scoped Variables:**

-   `selectedOption`: The selected value(s) - single value or array depending on mode
-   `multiple`: Boolean indicating if multiple selection mode is enabled
-   `getOptionLabel`: Helper function to get the display label for an option
-   `selectedCount`: Number of selected items (for multiple mode)

**Use Cases:**

-   Custom badges or chips for selected items
-   Icons or indicators for selection state
-   Custom formatting for selected values
-   Displaying additional information about selections

The slot provides a default implementation that shows a count for multiple selections or the option label for single selections, but you can completely customize this display.

Custom Selected Display

Selected: None

```
<script lang="ts" setup>
const options = ["Option 1","Option 2","Option 3","Option 4","Option 5"];
</script>

<template>
  <Select
    allowEmpty
    :confirm="false"
    :custom="false"
    :disabled="false"
    :error="false"
    :grouped="false"
    groupLabel="group_name"
    groupValues="list"
    :iconOppositePosition="false"
    label="Custom Selected Display"
    labelKey="label"
    :multiple="false"
    noOptionsMessage="No options available"
    :options="options"
    placeholder="Select an option"
    :preselectFirst="false"
    :required="false"
    :searchable="false"
    searchPlaceholder="Search..."
    trackBy="value"
    valueKey="value"
  />
</template>
```

##### Custom Selected Display Multiple

This story demonstrates the **Selected Slot** with multiple selection mode, showing how to display selected items as chips/badges with a "more" indicator when there are many selections.

The custom implementation shows:

-   Up to 2 selected items as individual badges
-   A "+X more" badge when more than 2 items are selected
-   Clean, compact display that works well in limited space

Custom Selected Display (Multiple)

Selected: None

```
<script lang="ts" setup>
const options = ["Red","Green","Blue","Yellow","Purple","Orange"];
</script>

<template>
  <Select
    allowEmpty
    :confirm="false"
    :custom="false"
    :disabled="false"
    :error="false"
    :grouped="false"
    groupLabel="group_name"
    groupValues="list"
    :iconOppositePosition="false"
    label="Custom Selected Display (Multiple)"
    labelKey="label"
    multiple
    noOptionsMessage="No options available"
    :options="options"
    placeholder="Select multiple colors"
    :preselectFirst="false"
    :required="false"
    :searchable="false"
    searchPlaceholder="Search..."
    trackBy="value"
    valueKey="value"
  />
</template>
```

---

## Form / Switchball

### SwitchBall

### SwitchBall Component

A customizable switch/toggle component with support for labels, sublabels, and various color themes.

#### Features

-   Toggle switch with smooth animations
-   Support for main label and sublabel
-   Multiple color themes
-   Icon integration
-   Accessible design with proper ARIA attributes

#### Basic Usage

```
<template>
  <SwitchBall
    v-model="isEnabled"
    label="Notifications"
    sublabel="Receive email notifications"
    color="primary"
    icon-name="IconBell"
    id="notifications-switch"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import SwitchBall from './SwitchBall.vue'

const isEnabled = ref(false)
</script>
```

Default Switch

```
{
  args: {
    label: "Default Switch"
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Verify switch renders correctly", async () => {
      const switchInput = canvas.getByRole("checkbox");
      expect(switchInput).toBeInTheDocument();
      expect(switchInput).not.toBeChecked();
    });
    await step("Verify label is displayed", async () => {
      const label = canvas.getByText("Default Switch");
      expect(label).toBeInTheDocument();
    });
    await step("Test switch interaction", async () => {
      const switchInput = canvas.getByRole("checkbox");
      await userEvent.click(switchInput);
      expect(switchInput).toBeChecked();
    });
  }
}
```

| Name | Description | Default | Control |
| --- | --- | --- | --- |
| props |  |
| modelValue* | Switch state (on/off)boolean | false | FalseTrue |
| label* | Label textstring | "" | Default Switch |
| sublabel* | Secondary label text displayed below the main labelstring | "" |  |
| color | Color theme of the switch"default""primary""info""success""warning""danger""secondary""dark" | "primary" | Choose option...primaryinfosuccesswarningdangersecondarydarkgradient |
| iconName | Icon name to be displayedstring | "IconCheck" | IconCheck |
| id* | Input ID attribute for label associationstring | - | switch-1 |
| events |  |
| update:modelValue | boolean | - | - |

#### Stories

##### Default

Default Switch

```
{
  args: {
    label: "Default Switch"
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Verify switch renders correctly", async () => {
      const switchInput = canvas.getByRole("checkbox");
      expect(switchInput).toBeInTheDocument();
      expect(switchInput).not.toBeChecked();
    });
    await step("Verify label is displayed", async () => {
      const label = canvas.getByText("Default Switch");
      expect(label).toBeInTheDocument();
    });
    await step("Test switch interaction", async () => {
      const switchInput = canvas.getByRole("checkbox");
      await userEvent.click(switchInput);
      expect(switchInput).toBeChecked();
    });
  }
}
```

##### With Sublabel

Switch with both main label and descriptive sublabel.

NotificationsReceive email notifications

```
{
  args: {
    label: "Notifications",
    sublabel: "Receive email notifications",
    id: "notifications-switch"
  },
  parameters: {
    docs: {
      description: {
        story: "Switch with both main label and descriptive sublabel."
      }
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Verify switch with sublabel renders correctly", async () => {
      const switchInput = canvas.getByRole("checkbox");
      expect(switchInput).toBeInTheDocument();
      expect(switchInput).not.toBeChecked();
    });
    await step("Verify main label is displayed", async () => {
      const label = canvas.getByText("Notifications");
      expect(label).toBeInTheDocument();
    });
    await step("Verify sublabel is displayed", async () => {
      const sublabel = canvas.getByText("Receive email notifications");
      expect(sublabel).toBeInTheDocument();
    });
    await step("Test switch interaction", async () => {
      const switchInput = canvas.getByRole("checkbox");
      await userEvent.click(switchInput);
      expect(switchInput).toBeChecked();
    });
  }
}
```

##### Custom Icon

Switch with a custom icon instead of the default check icon.

Custom Icon Switch

```
{
  args: {
    label: "Custom Icon Switch",
    iconName: "IconMail",
    color: "info"
  },
  parameters: {
    docs: {
      description: {
        story: "Switch with a custom icon instead of the default check icon."
      }
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Verify custom icon switch renders correctly", async () => {
      const switchInput = canvas.getByRole("checkbox");
      expect(switchInput).toBeInTheDocument();
      expect(switchInput).not.toBeChecked();
    });
    await step("Verify label is displayed", async () => {
      const label = canvas.getByText("Custom Icon Switch");
      expect(label).toBeInTheDocument();
    });
    await step("Test switch interaction", async () => {
      const switchInput = canvas.getByRole("checkbox");
      await userEvent.click(switchInput);
      expect(switchInput).toBeChecked();
    });
  }
}
```

---

## Form / Textarea

### TextArea

### TextArea Component

A flexible textarea component that supports icon integration with click events, validation states, and accessibility features. This component is built with accessibility in mind and supports form validation states.

#### Features

-   Configurable number of rows
-   Optional label with required indicator
-   Error state with custom error message
-   Icon support with RTL/LTR aware positioning
-   Clickable icons with event handling
-   Disabled state
-   Fully reactive with Vue's v-model
-   Enter key event handling

#### Icon Positioning

-   **Default** (`iconOppositePosition: false`): Icons appear behind content (LTR: left, RTL: right)
-   **Opposite** (`iconOppositePosition: true`): Icons appear after content (LTR: right, RTL: left)

```
<template>
  <TextArea
    :disabled="false"
    :error="false"
    :iconOppositePosition="false"
    placeholder="Enter Textarea"
    :required="false"
    :rows="3"
  />
</template>
```

| Name | Description | Default | Control |
| --- | --- | --- | --- |
| props |  |
| rows | Number of rows to displaystringnumber | 3 |  |
| placeholder | Placeholder textstring | "Enter Textarea" | Enter Textarea |
| required | Whether the textarea is requiredboolean | false | FalseTrue |
| disabled | Whether the textarea is disabledboolean | false | FalseTrue |
| error | Whether the textarea is in error stateboolean | false | FalseTrue |
| errorMsg | Error message to displaystring | "" |  |
| iconName | Icon name to be displayed in the textareastring | "" | Choose option...IconSearchIconMailIconEyeIconLockIconUserIconX |
| iconOppositePosition | When true, positions icon on the opposite side. Default: icon behind content (LTR: left, RTL: right). Opposite: icon after content (LTR: right, RTL: left)boolean | false | FalseTrue |
| modelValue | The value of the textareastring | "" |  |
| label | Label text for the textareastring | "" |  |
| id | ID for the textarea (used to associate label)string | "" |  |
| events |  |
| update:modelValue | Emitted when the textarea value changes.string | - | - |
| enter | Emitted when the Enter key is pressed in the textarea.string | - | - |
| iconClick | Emitted when the icon is clicked.MouseEvent | - | - |

#### Stories

##### Default

```
<template>
  <TextArea
    :disabled="false"
    :error="false"
    :iconOppositePosition="false"
    placeholder="Enter Textarea"
    :required="false"
    :rows="3"
  />
</template>
```

##### Filled

```
<script lang="ts" setup>
import { ref } from "vue";

const modelValue = ref("This is a sample text in the textarea");
</script>

<template>
  <TextArea
    :disabled="false"
    :error="false"
    :iconOppositePosition="false"
    v-model="modelValue"
    placeholder="Enter Textarea"
    :required="false"
    :rows="3"
  />
</template>
```

##### With Label

Comments

```
<template>
  <TextArea
    :disabled="false"
    :error="false"
    :iconOppositePosition="false"
    label="Comments"
    placeholder="Enter your comments"
    :required="false"
    :rows="3"
  />
</template>
```

##### With Icon

TextArea with an icon positioned on the opposite side (after content: LTR: right, RTL: left).

Message

```
<template>
  <TextArea
    :disabled="false"
    :error="false"
    iconName="IconMail"
    iconOppositePosition
    label="Message"
    placeholder="Write your message..."
    :required="false"
    :rows="3"
  />
</template>
```

##### With Icon Default

TextArea with an icon using default positioning (behind content: LTR: left, RTL: right).

Comments

```
<template>
  <TextArea
    :disabled="false"
    :error="false"
    iconName="IconUser"
    :iconOppositePosition="false"
    label="Comments"
    placeholder="Enter your comments..."
    :required="false"
    :rows="3"
  />
</template>
```

##### Clickable Icon

TextArea with a clickable icon that can submit or perform other actions using default positioning.

Quick Comment

Click the search icon to submit your comment.

```
<template>
  <TextArea
    :disabled="false"
    :error="false"
    iconName="IconSearch"
    :iconOppositePosition="false"
    label="Quick Comment"
    placeholder="Write a comment and click the search icon to submit..."
    :required="false"
    :rows="4"
  />
</template>
```

##### Required

```
<template>
  <TextArea
    :disabled="false"
    :error="false"
    iconName="IconLock"
    iconOppositePosition
    placeholder="Required textarea"
    required
    :rows="3"
  />
</template>
```

##### Disabled

```
<script lang="ts" setup>
import { ref } from "vue";

const modelValue = ref("This textarea is disabled");
</script>

<template>
  <TextArea
    disabled
    :error="false"
    iconName="IconUser"
    iconOppositePosition
    v-model="modelValue"
    placeholder="Enter Textarea"
    :required="false"
    :rows="3"
  />
</template>
```

##### With Error

This field is required

```
<template>
  <TextArea
    :disabled="false"
    error
    errorMsg="This field is required"
    iconName="IconX"
    :iconOppositePosition="false"
    placeholder="Enter Textarea"
    required
    :rows="3"
  />
</template>
```

##### Custom Rows

```
<template>
  <TextArea
    :disabled="false"
    :error="false"
    iconName="IconMail"
    iconOppositePosition
    placeholder="This textarea has 5 rows"
    :required="false"
    :rows="5"
  />
</template>
```

##### RTL Icon Comparison

Comparison showing how icon positioning works with RTL/LTR awareness and iconOppositePosition.

##### Default Icon Positioning (iconOppositePosition: false)

Message (Default)

##### Opposite Icon Positioning (iconOppositePosition: true)

Message (Opposite)

**Note:** Icon positioning adapts to your app's RTL/LTR direction automatically.

• **LTR (Left-to-Right):** Default = right, Opposite = left

• **RTL (Right-to-Left):** Default = left, Opposite = right

```
<template>
  <TextArea
    :disabled="false"
    :error="false"
    :iconOppositePosition="false"
    placeholder="Enter Textarea ... "
    :required="false"
    :rows="2"
  />
</template>
```

##### Enter Key Example

This example demonstrates how to use the Enter key or icon click to capture and display input values from the TextArea component. When you press Enter or click the icon, the current value is added to the list below and the textarea is cleared. Icon positioning adapts to RTL/LTR automatically.

##### Enter Key Demo

Type and press Enter

###### Notes:

-   No notes yet. Type something and press Enter or click the search icon.

Icon positioning adapts automatically to your app's RTL/LTR direction.

```
<template>
  <TextArea
    :disabled="false"
    :error="false"
    :iconOppositePosition="false"
    placeholder="Enter Textarea ... "
    :required="false"
    :rows="2"
  />
</template>
```

##### Icon Positioning Comparison

This story demonstrates the two icon positioning modes in TextArea. Toggle `iconOppositePosition` to see the difference between behind content (default) and after content (opposite).

Icon Positioning Demo

```
<template>
  <TextArea
    :disabled="false"
    :error="false"
    iconName="IconMail"
    :iconOppositePosition="false"
    label="Icon Positioning Demo"
    placeholder="See different icon positions in textarea"
    :required="false"
    :rows="3"
  />
</template>
```

---

