<div align="center">
  <img src="./public/android-chrome-192.png" alt="Koda Bookmarks Logo" width="128" height="128" />
  <h1>Koda Bookmarks</h1>
  <p>A lightning-fast, keyboard-centric bookmark manager for Chromium browsers. Inspired by Spotlight and Raycast, Koda Bookmarks allows you to search, save, move, and organize your bookmarks without ever leaving your keyboard.</p>
</div>

## ✨ Features

- **Keyboard-First Workflow:** Press `Cmd/Ctrl + Shift + K` to instantly open the palette on any webpage.
- **Fuzzy Search:** Quickly find nested bookmark folders with an intelligent fuzzy search algorithm.
- **Create on the Fly:** Type a new folder name and hit `Enter` to create it and save your bookmark in one seamless action.
- **Context Aware:** Automatically detects if the current page is already bookmarked, allowing you to move or update it effortlessly.
- **Edit Before Saving:** Easily tweak the page title and URL directly within the UI before saving.
- **Bulletproof UI:** Built using a Shadow DOM wrapper, ensuring the interface never breaks or inherits messy CSS from host websites like YouTube or Facebook.
- **Modern Tech Stack:** Powered by React, Vite 5, and the newly released Tailwind CSS v4.

## 🚀 Installation (Developer Preview)

Currently, Koda Bookmarks is available for manual installation.

1. Clone this repository:

   ```bash
   git clone [https://github.com/yourusername/koda-bookmarks.git](https://github.com/yourusername/koda-bookmarks.git)
   cd koda-bookmarks
   ```

2. Install the dependencies using pnpm (or your preferred package manager):

```bash
pnpm install
```

3. Build the project:

```bash
pnpm build
```

4. Load the extension in Chrome:

- Navigate to `chrome://extensions/` in your browser.
- Enable Developer mode in the top right corner.
- Click Load unpacked and select the dist folder generated inside your project directory.

## ⌨️ Usage

Once installed, navigate to any webpage and use the global shortcut:

- Mac: `Cmd + Shift + K`
- Windows/Linux: `Ctrl + Shift + K`

**Shortcuts inside Koda:**

- `↑` / `↓`: Navigate the folder list
- `Enter`: Save to selected folder, or create a new folder
- `Tab` / `Shift + Tab`: Navigate between Title, URL, and Search inputs
- `Cmd`/`Ctrl` + `Backspace`: Delete the current bookmark
- `Esc`: Go back or close the palette

## 🗺️ Roadmap & Future Improvements

We are constantly looking to improve Koda. Here are a few features planned for upcoming releases:

- **Custom Theme Colors**: Allow users to customize the palette's accent colors beyond the default Teal.
- **Localization (i18n)**: Support for multiple languages to make Koda accessible worldwide.
- **Advanced Tagging**: Add metadata tags to bookmarks for even faster retrieval.

## 🤝 Contributing

Koda Bookmarks is open-source and we would love your help! Whether it is a bug report, a new feature request, or a pull request, all contributions are welcome.

- Have an idea or found a bug? Please open an issue on this repository.
- Want to contribute code? Fork the repository, create a feature branch, and submit a Pull Request.

## 📄 License

Distributed under the MIT License. See LICENSE for more information.
