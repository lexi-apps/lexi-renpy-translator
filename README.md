<div align="center">

<img src="assets/lexi_mark.png" alt="Lexi logo" width="120">

# Lexi — Ren'Py Translator

**Translate Ren'Py visual novels into your language, safely and without breaking the game.**

[![Latest release](https://img.shields.io/github/v/release/lexi-apps/lexi-renpy-translator)](https://github.com/lexi-apps/lexi-renpy-translator/releases/latest)
[![Downloads](https://img.shields.io/github/downloads/lexi-apps/lexi-renpy-translator/total)](https://github.com/lexi-apps/lexi-renpy-translator/releases)
![Platform](https://img.shields.io/badge/platform-Windows%2010%2F11-0078D6)
[![Support on Patreon](https://img.shields.io/badge/Patreon-Support%20Lexi-F96854?logo=patreon&logoColor=white)](https://www.patreon.com/cw/LexiApps)

### [⬇️ Download the latest version](https://github.com/lexi-apps/lexi-renpy-translator/releases/latest)

</div>

---

Lexi is a desktop app for Windows that translates Ren'Py visual novel games into other languages. It scans the game, translates it with the engine you choose, and writes the result using Ren'Py's own translation system.

## Why Lexi?

- **Works on real games.** Reads `.rpy` scripts, compiled `.rpyc` files (built-in decoder) and games packed in `.rpa` archives.
- **Your game stays safe.** Automatic backup before anything is written, with one-click restore.
- **Your tags stay intact.** Ren'Py tags, variables and format codes are protected, and broken lines are caught and retried.
- **No surprise bills.** Paid engines show an estimated cost and ask for your approval before starting.
- **Easy to try.** Every new computer gets a 3-day free trial, and Basic needs no API key.

## Plans

| Plan | Price | What you get |
|---|---|---|
| **Basic** | $4/mo | Machine translation: Google, Microsoft Edge, Bing, Yandex, LibreTranslate and the free engine chain |
| **Plus** | $7/mo | Basic + AI engines with your own API key: OpenAI and other AI providers |
| **Pro** | $12/mo | Plus + monthly Lexi AI credits (coming soon) |

Every new computer gets a 3-day free trial (Plus features). Subscribe on [Patreon](https://www.patreon.com/cw/LexiApps), then press **Sign in with Patreon** in Lexi — your license is activated and renewed automatically. One license = one computer.

## Screenshots

Lexi runs as a desktop app on Windows. The screens below show the main areas of the interface, using a sample Ren'Py game (The Question, a Ren'Py SDK demo) and the dark "Night" colour theme.

| | |
|---|---|
| ![Overview](screenshots/01-overview.png) | ![Game scan](screenshots/02-scan.png) |
| **Overview**: progress, backups and live preview of the translation | **Game scan**: counts the lines of text in a game folder without changing any files |
| ![Translation settings](screenshots/03-engine-settings.png) | ![Quality and editing](screenshots/04-quality-editor.png) |
| **Translation settings**: pick the target language and the translation service | **Quality and editing**: find broken, untranslated or empty lines and fix them in place |
| ![Tools](screenshots/05-tools-coverage.png) | ![Glossary](screenshots/06-glossary.png) |
| **Tools**: in-game coverage, in-game scan and mod translation | **Glossary**: protect character names and set fixed translations |
| ![Application](screenshots/07-themes.png) | ![About](screenshots/08-about.png) |
| **Application**: interface language, colour themes and background | **About**: update check, Ren'Py version board and changelog |

## Features

### 🔎 Scanning and output
- Finds dialogue, menus and interface text.
- Handles `.rpy`, compiled `.rpyc` and `.rpa`-archived games.
- Writes translations to the game's `tl/<language>/` folder using Ren'Py's native translation system.
- Can add a language switcher to the game.
- Safety net for text that would otherwise escape translation in-game, plus a coverage check.

### 🌐 Translation engines
- Free engine chain (no key needed), Bing and Yandex.
- Bring your own API key for OpenAI (GPT models) and other AI providers.
- Target languages: whatever the selected engine supports.
- Source language is detected automatically, or pick it by hand: English, Japanese, Chinese, Korean, Russian, Spanish, Portuguese, German, French, Italian, Polish, Turkish, Indonesian, Vietnamese, Thai.

### 💰 Cost control (paid engines)
- Estimated cost shown before work starts, with a confirmation step.
- Cost ceiling you can set.
- Translation memory (cache): lines already translated are reused instead of being paid for again.

### 🛡️ Text protection and quality
- Preserves Ren'Py tags (`{b}`, `{i}`, `{color}`…), variables (`[name]`) and format codes.
- Detects damaged lines and retries them.
- Quality check and a translation editor for manual fixes.
- Glossary (term list) for consistent names and terms.
- Translations saved per game; mod translation supported.

### 🎨 Interface
- Available in 11 languages: English, Türkçe, Русский, 中文, 日本語, Español, Português (Brasil), Deutsch, Français, 한국어, Polski.
- 12 color themes and custom background image.
- Automatic updates from this repository, installed with one click.

## Getting started

1. Download `Lexi-RenPy-Translator-Setup-0.2.1.exe` from the [Releases page](https://github.com/lexi-apps/lexi-renpy-translator/releases/latest).
2. Run it. The installer is per-user, so no administrator rights are needed.
3. Open Lexi and start the 3-day free trial, or sign in with Patreon if you already subscribe.
4. Select your Ren'Py game, choose the target language and a translation engine (review the estimate if the engine is paid).
5. Start the translation, check the result in the editor, and launch your game.

## Requirements

- Windows 10 or 11 (64-bit)
- About 125 MB for the installer
- Internet connection for online translation engines and update checks

## Privacy & safety

- API keys are stored in the Windows Credential Manager.
- Settings, translation memory and backups stay on your computer.
- Uninstalling Lexi does not delete your data.
- Update files are verified with a digital signature and SHA-256 before installing.
- The automatic update check connects to GitHub and can be turned off in Settings.

## FAQ

**Windows SmartScreen warns me when I run the installer. Is that normal?**
The installer is not code-signed yet, so SmartScreen may show a warning. Click **More info → Run anyway** to continue.

**Do I need an API key?**
No, not for Basic. API keys are only needed for OpenAI and other AI providers (Plus).

**Will Lexi change my original game files?**
Translations are written through Ren'Py's own `tl/<language>/` system, and Lexi makes an automatic backup before writing. You can restore it with one click.

**Can I turn off update checks?**
Yes, in Settings. The check connects to GitHub.

## Support Lexi

Lexi's membership plans are on **[Patreon](https://www.patreon.com/cw/LexiApps)**. Your support pays for development, testing on more games and new features.

## Reporting bugs

Found a problem? In Lexi, open the **About** tab and press **Report a problem** to send an error report (Lexi also offers to report after a crash). You can also open an issue on [GitHub Issues](https://github.com/lexi-apps/lexi-renpy-translator/issues) and describe what happened, your Lexi version and, if possible, the game and engine you used.

## License

Lexi is closed-source software. The source code is not part of this repository, which only hosts releases and this page.

<details>
<summary>🇹🇷 Türkçe özet</summary>

**Lexi — Ren'Py Translator**, Ren'Py görsel roman oyunlarını başka dillere çeviren bir Windows masaüstü programıdır (Windows 10/11, 64-bit).

- `.rpy`, derlenmiş `.rpyc` ve `.rpa` arşivli oyunları tarar; çeviriyi Ren'Py'ın kendi `tl/<dil>/` sistemiyle yazar.
- Planlar: Basic 4 $/ay (makine çevirisi: Google, Microsoft Edge, Bing, Yandex, LibreTranslate, ücretsiz motor zinciri; API anahtarı gerekmez), Plus 7 $/ay (Basic + kendi anahtarınızla OpenAI ve diğer yapay zekâ sağlayıcıları), Pro 12 $/ay (Plus + aylık Lexi yapay zekâ kredisi, yakında).
- Her yeni bilgisayara 3 gün ücretsiz deneme (Plus özellikleri) verilir. [Patreon](https://www.patreon.com/cw/LexiApps)'a üye olup Lexi'de **Sign in with Patreon** düğmesine basın; lisans kendiliğinden açılır ve yenilenir. Bir lisans = bir bilgisayar.
- Ücretli motorlarda başlamadan önce tahmini tutar ve onay, maliyet tavanı, çeviri hafızası.
- Ren'Py etiketleri, değişkenler ve biçim kodları korunur; yazmadan önce otomatik yedek ve tek tıkla geri dönüş.
- Arayüz 11 dilde, 12 renk teması, otomatik güncelleme.
- Kurulum: [Releases](https://github.com/lexi-apps/lexi-renpy-translator/releases/latest) sayfasından `Lexi-RenPy-Translator-Setup-0.2.1.exe` dosyasını indirip çalıştırın. Kurulum dosyası henüz kod imzalı değildir; SmartScreen uyarısında "More info → Run anyway" seçin.
- Hata bildirimi: Lexi'de Hakkında sekmesindeki **Report a problem** düğmesi veya GitHub Issues. Program kapalı kaynaklıdır.
- Destek: [Patreon](https://www.patreon.com/cw/LexiApps)

</details>
