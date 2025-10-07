(function () {
  "use strict";

  class DesmosKeyboardAssistant {
    constructor() {
      this.isCustomKeyboardVisible = false;
      this.observer = null;
      this.ariaHiddenObserver = null; // aria-hidden専用Observer
      this.customKeyboard = null;
      this.isShiftPressed = false;
      this.isShowMessageVisible = false; // デバッグ用 trueにすると画面上部にメッセージを表示

      // イベントハンドラ管理
      this.attachedEventHandlers = new Map(); // ボタンとイベントハンドラのマップ

      // αβγΓϝδΔϵεζηθΘϑικϰλΛμνξΞπΠϖρϱσΣςτυΥϕΦφχψΨω
      this.greekLetters = [
        [
          { normal: "α", shift: "ι" },
          { normal: "β", shift: "ϑ" },
          { normal: "γ", shift: "Γ" },
          { normal: "δ", shift: "Δ" },
          { normal: "ε", shift: "ϵ" },
          { normal: "ζ", shift: "η" },
          { normal: "θ", shift: "Θ" },
          { normal: "κ", shift: "ϰ" },
        ],
        [
          { normal: "λ", shift: "Λ" },
          { normal: "μ", shift: "ν" },
          { normal: "ξ", shift: "Ξ" },
          { normal: "π", shift: "Π" },
          { normal: "ρ", shift: "ϱ" },
          { normal: "σ", shift: "Σ" },
          { normal: "τ", shift: "ς" },
          { normal: "υ", shift: "Υ" },
        ],
        [
          { normal: "φ", shift: "Φ" },
          { normal: "χ", shift: "ϕ" },
          { normal: "ψ", shift: "Ψ" },
          { normal: "ω", shift: "ϖ" },
          { normal: "Ϝ", shift: "∞" },
        ],
      ];

      this.init();
    }

    init() {
      // DOM読み込み完了後に初期化
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => this.setupObserver());
      } else {
        this.setupObserver();
      }
    }

    setupObserver() {
      // .dcg-keys-containerを監視するためのMutationObserver
      this.observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === "childList") {
            this.handleKeysContainerChange();
          }
        });
      });

      this.startObservation();
    }

    startObservation() {
      const keysContainer = document.querySelector(".dcg-keys-container");
      if (keysContainer) {
        this.observer.observe(keysContainer, {
          childList: true,
          subtree: true,
        });
        // 初回の変更を処理
        this.handleKeysContainerChange();

        // aria-hidden専用Observerをセットアップ
        this.setupAriaHiddenObserver();
      } else {
        // .dcg-keys-containerが見つからない場合は、少し待ってから再試行
        setTimeout(() => this.startObservation(), 1000);
      }
    }

    // aria-hidden専用Observerのセットアップ
    setupAriaHiddenObserver() {
      const keysContainer = document.querySelector(".dcg-keys-container");
      if (!keysContainer) return;

      // aria-hidden専用のMutationObserver
      this.ariaHiddenObserver = new MutationObserver((mutations) => {
        console.log("aria-hidden attribute changed", mutations);
        this.handleAriaHiddenChange();
      });

      // aria-hiddenのみを監視
      this.ariaHiddenObserver.observe(keysContainer, {
        attributes: true,
        attributeFilter: ["aria-hidden"],
      });

      // 初回チェック
      this.handleAriaHiddenChange();
    }

    handleKeysContainerChange() {
      const keysContainer = document.querySelector(".dcg-keys-container");
      if (!keysContainer) return;

      // dcg-command="ABC"のボタンを探す
      const abcButtons = keysContainer.querySelectorAll('span[dcg-command="ABC"]');
      abcButtons.forEach((abcButton) => {
        this.insertCustomKeyboardButtonAfterABC(abcButton);
      });

      // dcg-command="Audio"のボタンを削除する
      const audioButtons = keysContainer.querySelectorAll('span[dcg-command="Audio"]');
      audioButtons.forEach((audioButton) => {
        this.removeAudioButton(audioButton);
      });
    }

    // aria-hidden変化をハンドリング
    handleAriaHiddenChange() {
      const keysContainer = document.querySelector(".dcg-keys-container");
      if (!keysContainer) return;
      const isHidden = keysContainer.getAttribute("aria-hidden") === "true";
      console.log(isHidden, this.isCustomKeyboardVisible);

      if (isHidden && this.isCustomKeyboardVisible) {
        // キーボードが非表示でカスタムキーボードが表示中の場合、イベントを削除
        this.removeAllEventHandlers();
      } else if (!isHidden && this.isCustomKeyboardVisible) {
        // キーボードが表示でカスタムキーボードが表示中の場合、イベントを追加
        setTimeout(() => this.reattachAllEventHandlers(), 100);
      }
    }

    // 全イベントハンドラを削除
    removeAllEventHandlers() {
      this.attachedEventHandlers.forEach((handler, button) => {
        button.removeEventListener("click", handler);
      });
    }

    // 全イベントハンドラを再アタッチ
    reattachAllEventHandlers() {
      this.attachedEventHandlers.forEach((handler, button) => {
        button.addEventListener("click", handler);
      });
    }

    insertCustomKeyboardButtonAfterABC(abcButton) {
      // 既に挿入済みかチェック
      const abcContainer = abcButton.closest(".dcg-keypad-btn-container");
      if (!abcContainer) return;

      // 既にカスタムボタンが存在するかチェック
      const nextContainer = abcContainer.nextElementSibling;
      if (nextContainer && nextContainer.querySelector('[data-custom-greek="true"]')) {
        return; // 既に挿入済み
      }

      // ABCボタンのflex-growを2から1に変更
      abcContainer.style.flexGrow = "1";

      // 新しいギリシャ文字ボタンDOMを作成
      const newButtonHTML = `
        <div class="dcg-keypad-btn-container" style="flex-grow:1">
          <span role="button" class="dcg-keypad-btn dcg-btn-dark-on-gray" aria-label="ギリシャ文字キーボード" ontap="" data-custom-greek="true">
            <span class="dcg-keypad-btn-content">
              <div class="dcg-mq-math-mode dcg-static-mathquill-view">
                <span class="dcg-mq-root-block" aria-hidden="true">
                  <span class="dcg-mq-nonSymbola">α</span>
                </span>
              </div>
            </span>
          </span>
        </div>
      `;

      // 新しいボタンDOMを作成して挿入
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = newButtonHTML;
      const newButtonContainer = tempDiv.firstElementChild;

      // ABCボタンの直後に挿入
      abcContainer.parentNode.insertBefore(newButtonContainer, abcContainer.nextElementSibling);

      // 新しいボタンにクリックイベントを追加
      const newButton = newButtonContainer.querySelector(".dcg-keypad-btn");
      if (newButton) {
        newButton.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.toggleCustomKeyboard();
        });
      }
    }

    removeAudioButton(audioButton) {
      // 既に削除済みかチェック
      if (!audioButton || !audioButton.parentNode) return;

      // Audioボタンのコンテナを取得
      const buttonContainer = audioButton.closest(".dcg-keypad-btn-container");
      if (buttonContainer && buttonContainer.parentNode) {
        buttonContainer.parentNode.removeChild(buttonContainer);
      }
    }

    toggleCustomKeyboard() {
      if (this.isCustomKeyboardVisible) {
        this.hideCustomKeyboard();
      } else {
        this.showCustomKeyboard();
      }
    }

    showCustomKeyboard() {
      const keysContainer = document.querySelector(".dcg-keys-container");
      if (!keysContainer || this.customKeyboard) return;

      // デフォルトキーボードを非表示にする
      this.hideDefaultKeyboard();

      this.customKeyboard = this.createCustomKeyboard();
      keysContainer.appendChild(this.customKeyboard);
      this.isCustomKeyboardVisible = true;

      this.customKeyboard.classList.add("dcg-custom-keyboard-visible");
    }

    hideCustomKeyboard() {
      if (!this.customKeyboard) return;

      this.customKeyboard.classList.remove("dcg-custom-keyboard-visible");

      if (this.customKeyboard && this.customKeyboard.parentNode) {
        this.customKeyboard.parentNode.removeChild(this.customKeyboard);
      }
      this.customKeyboard = null;
      this.isCustomKeyboardVisible = false;
      this.isShiftPressed = false;

      // イベントハンドラマップをクリア
      this.attachedEventHandlers.clear();

      // デフォルトキーボードを再表示
      this.showDefaultKeyboard();
    }

    createCustomKeyboard() {
      const keyboardHTML = `
        <div class="dcg-keys-background dcg-do-not-blur">
          <div class="dcg-keys">
            <div class="dcg-basic-keypad dcg-do-not-blur">
              ${this.generateGreekKeyboardRows()}
              ${this.generateControlRow()}
            </div>
          </div>
        </div>
      `;

      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = keyboardHTML;
      const keyboard = tempDiv.firstElementChild;

      // イベントリスナーを追加
      this.attachKeyboardEvents(keyboard);

      return keyboard;
    }

    generateGreekKeyboardRows() {
      let rowsHTML = "";

      // ギリシャ文字の行を生成
      this.greekLetters.forEach((row, rowIndex) => {
        let rowHTML = '<div class="dcg-keypad-row">';

        // 3行目の場合はShiftキーを最初に追加
        if (rowIndex === 2) {
          rowHTML += this.generateShiftButton();
        }

        // 各文字ボタンを生成
        row.forEach((letter) => {
          rowHTML += this.generateLetterButton(letter.normal, letter.shift);
        });

        // 3行目の場合はBackspaceキーを最後に追加
        if (rowIndex === 2) {
          rowHTML += this.generateBackspaceButton();
        }

        rowHTML += "</div>";
        rowsHTML += rowHTML;
      });

      return rowsHTML;
    }

    generateLetterButton(normal, shift) {
      const isSpecialPi = normal === "π" || shift === "Π";
      const displayChar = normal;

      return `
        <div class="dcg-keypad-btn-container" style="flex-grow:1">
          <span role="button" class="dcg-keypad-btn dcg-btn-light-on-gray" data-symbol="${normal}" data-symbol-shift="${shift}" aria-label="${normal}/${shift}" ontap="">
            <span class="dcg-keypad-btn-content">
              <div class="dcg-mq-math-mode dcg-static-mathquill-view">
                <span class="dcg-mq-root-block" aria-hidden="true">${
                  isSpecialPi
                    ? `<span class="dcg-mq-nonSymbola">${displayChar}</span>`
                    : `<var>${displayChar}</var>`
                }</span>
              </div>
            </span>
          </span>
        </div>
      `;
    }

    generateShiftButton() {
      return `
        <div class="dcg-keypad-btn-container" style="flex-grow:1.5">
          <span role="button" class="dcg-keypad-btn dcg-btn-dark-on-gray" data-action="shift" aria-label="Shift" ontap="">
            <span class="dcg-keypad-btn-content"><i class="dcg-icon-shift" aria-hidden="true"></i></span>
          </span>
        </div>
      `;
    }

    generateBackspaceButton() {
      return `
        <div class="dcg-keypad-btn-container" style="flex-grow:1.5">
          <span role="button" class="dcg-keypad-btn dcg-btn-dark-on-gray" data-action="backspace" aria-label="バックスペース" ontap="">
            <span class="dcg-keypad-btn-content"><i class="dcg-icon-delete" aria-hidden="true"></i></span>
          </span>
        </div>
      `;
    }

    generateControlRow() {
      return `
        <div class="dcg-keypad-row">
          <div class="dcg-keypad-btn-container" style="flex-grow:1.5">
            <span role="button" class="dcg-keypad-btn dcg-btn-dark-on-gray dcg-keyboard-close" dcg-command="123" aria-label="数値に切り替え" ontap="">
              <span class="dcg-keypad-btn-content">1 2 3</span>
            </span>
          </div>
          <div class="dcg-keypad-btn-container" style="flex-grow:0.8">
            <span role="button" class="dcg-keypad-btn dcg-btn-dark-on-gray" data-action="select-left" aria-label="左選択" ontap="">
              <span class="dcg-keypad-btn-content">◄</span>
            </span>
          </div>
          <div class="dcg-keypad-btn-container" style="flex-grow:0.8">
            <span role="button" class="dcg-keypad-btn dcg-btn-dark-on-gray" data-action="select-right" aria-label="右選択" ontap="">
              <span class="dcg-keypad-btn-content">►</span>
            </span>
          </div>
          <div class="dcg-keypad-btn-container" style="flex-grow:1">
            <span role="button" class="dcg-keypad-btn dcg-btn-dark-on-gray" data-action="select-all" aria-label="全選択" ontap="">
              <span class="dcg-keypad-btn-content">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" role="img">
                  <title>Select all</title>
                  <g fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">
                    <!-- outer dotted rectangle -->
                    <rect x="3" y="3" width="18" height="18" rx="2" stroke-dasharray="3 2"/>
                    <!-- corner handles -->
                    <rect x="3" y="3" width="3" height="3" fill="currentColor"/>
                    <rect x="18" y="3" width="3" height="3" fill="currentColor"/>
                    <rect x="3" y="18" width="3" height="3" fill="currentColor"/>
                    <rect x="18" y="18" width="3" height="3" fill="currentColor"/>
                  </g>
                </svg>
              </span>
            </span>
          </div>
          <div class="dcg-keypad-btn-container" style="flex-grow:1">
            <span role="button" class="dcg-keypad-btn dcg-btn-dark-on-gray" data-action="copy" aria-label="コピー" ontap="">
              <span class="dcg-keypad-btn-content">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" role="img">
                  <title>Copy</title>
                  <g fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">
                    <!-- back page -->
                    <rect x="7" y="4" width="11" height="14" rx="1.5"/>
                    <!-- front page slightly offset -->
                    <rect x="4" y="7" width="11" height="14" rx="1.5"/>
                  </g>
                </svg>
              </span>
            </span>
          </div>
          <div class="dcg-keypad-btn-container" style="flex-grow:1">
            <span role="button" class="dcg-keypad-btn dcg-btn-dark-on-gray" data-action="paste" aria-label="ペースト" ontap="">
              <span class="dcg-keypad-btn-content">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" role="img">
                <title>Paste</title>
                <g fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">
                  <!-- clipboard body -->
                  <rect x="6" y="5" width="12" height="14" rx="2"/>
                  <!-- clip at top -->
                  <path d="M9 4.5h6a1.5 1.5 0 0 1 1.5 1.5v0a1 1 0 0 1-1 1H8.5a1 1 0 0 1-1-1v0A1.5 1.5 0 0 1 9 4.5z" stroke="currentColor" fill="none"/>
                  <!-- a short page line to indicate content -->
                  <path d="M9 10h6M9 13h6" stroke-width="1.4"/>
                </g>
              </svg>
              </span>
            </span>
          </div>
          <div class="dcg-keypad-btn-container" style="flex-grow:1.5">
            <span role="button" class="dcg-keypad-btn dcg-btn-blue" data-action="return" aria-label="Enter" ontap="">
              <span class="dcg-keypad-btn-content">
                <i class="dcg-icon-arrow-enter" aria-hidden="true"></i>
              </span>
            </span>
          </div>
        </div>
      `;
    }

    attachKeyboardEvents(keyboard) {
      // 閉じるボタン
      const closeBtn = keyboard.querySelector(".dcg-keyboard-close");
      const closeHandler = () => this.hideCustomKeyboard();
      closeBtn.addEventListener("click", closeHandler);
      this.attachedEventHandlers.set(closeBtn, closeHandler);

      // 全ボタンのイベント
      const allButtons = keyboard.querySelectorAll(".dcg-keypad-btn");
      allButtons.forEach((button) => {
        const action = button.getAttribute("data-action");

        // 選択ボタンの場合は特別なイベントハンドラを追加
        if (action === "select-left" || action === "select-right") {
          this.attachSimpleSelectionEvents(button, action);
        } else {
          const handler = (e) => {
            const symbol = button.getAttribute("data-symbol");
            const symbolShift = button.getAttribute("data-symbol-shift");

            if (action === "shift") {
              this.toggleShift(keyboard);
            } else if (action === "backspace") {
              this.handleBackspace();
            } else if (action) {
              this.handleAction(action);
            } else if (symbol || symbolShift) {
              const symbolToInsert = this.isShiftPressed && symbolShift ? symbolShift : symbol;
              if (symbolToInsert) {
                this.insertSymbol(symbolToInsert);
              }
            }
          };
          button.addEventListener("click", handler);
          this.attachedEventHandlers.set(button, handler);
        }
      });
    }

    toggleShift(keyboard) {
      this.isShiftPressed = !this.isShiftPressed;

      // Shiftボタンの表示を更新
      const shiftBtn = keyboard.querySelector('[data-action="shift"]');
      if (shiftBtn) {
        if (this.isShiftPressed) {
          shiftBtn.classList.add("dcg-btn-blue");
          shiftBtn.classList.remove("dcg-btn-dark-on-gray");
        } else {
          shiftBtn.classList.add("dcg-btn-dark-on-gray");
          shiftBtn.classList.remove("dcg-btn-blue");
        }
      }

      // 全シンボルボタンの表示を更新
      this.updateSymbolDisplay(keyboard);
    }

    updateSymbolDisplay(keyboard) {
      const symbolButtons = keyboard.querySelectorAll("[data-symbol]");
      symbolButtons.forEach((button) => {
        const symbol = button.getAttribute("data-symbol");
        const symbolShift = button.getAttribute("data-symbol-shift");
        const symbolToShow = this.isShiftPressed && symbolShift ? symbolShift : symbol;

        const mathBlock = button.querySelector(".dcg-mq-root-block");
        if (mathBlock && symbolToShow) {
          if (symbolToShow === "π" || symbolToShow === "Π") {
            mathBlock.innerHTML = `<span class="dcg-mq-nonSymbola">${symbolToShow}</span>`;
          } else {
            mathBlock.innerHTML = `<var>${symbolToShow}</var>`;
          }
        }
      });
    }

    // 直接Calcオブジェクトにアクセス可能
    insertSymbol(symbol) {
      try {
        if (window.Calc && window.Calc.focusedMathQuill && window.Calc.focusedMathQuill.mq) {
          window.Calc.controller.dispatch({ type: "keypad/type-text", text: symbol });
        } else {
          console.warn("Calc.focusedMathQuill.mq not available");
          this.showMessage(`MathQuillが利用できません: ${symbol}`);
        }
      } catch (error) {
        console.error("Error inserting symbol:", error);
        this.showMessage("文字の挿入でエラーが発生しました");
      }
    }

    handleBackspace() {
      try {
        if (window.Calc && window.Calc.focusedMathQuill && window.Calc.focusedMathQuill.mq) {
          window.Calc.controller.dispatch({ type: "keypad/press-key", key: "Backspace" });
        } else {
          console.warn("Calc.focusedMathQuill.mq not available for backspace");
          this.showMessage("バックスペースの処理に失敗しました");
        }
      } catch (error) {
        console.error("Error handling backspace:", error);
        this.showMessage("バックスペースでエラーが発生しました");
      }
    }

    handleAction(action) {
      try {
        switch (action) {
          case "copy":
            this.copyMathExpression();
            break;
          case "paste":
            this.pasteMathExpression();
            break;
          case "select-all":
            this.selectAllMathExpression();
            break;
          case "return":
            this.handleReturn();
            break;
        }
      } catch (error) {
        console.error("Error handling action:", error);
        this.showMessage(`アクション実行でエラーが発生しました: ${action}`);
      }
    }

    // 選択ボタンのシンプルなイベントハンドラを設定
    attachSimpleSelectionEvents(button, action) {
      // クリックイベント
      const handler = (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (action === "select-left") {
          this.selectLeft();
        } else if (action === "select-right") {
          this.selectRight();
        }
      };

      button.addEventListener("click", handler);
      this.attachedEventHandlers.set(button, handler);
    } // 左選択
    selectLeft() {
      try {
        if (window.Calc && window.Calc.focusedMathQuill && window.Calc.focusedMathQuill.mq) {
          window.Calc.focusedMathQuill.mq.__controller.selectLeft();
        } else {
          this.showMessage("MathQuillが利用できません");
        }
      } catch (error) {
        console.error("Error selecting left:", error);
        this.showMessage("左選択でエラーが発生しました");
      }
    }

    // 右選択
    selectRight() {
      try {
        if (window.Calc && window.Calc.focusedMathQuill && window.Calc.focusedMathQuill.mq) {
          window.Calc.focusedMathQuill.mq.__controller.selectRight();
        } else {
          this.showMessage("MathQuillが利用できません");
        }
      } catch (error) {
        console.error("Error selecting right:", error);
        this.showMessage("右選択でエラーが発生しました");
      }
    }

    copyMathExpression() {
      try {
        if (window.Calc && window.Calc.focusedMathQuill && window.Calc.focusedMathQuill.mq) {
          const selection =
            window.Calc.focusedMathQuill.mq.__controller.exportLatexSelection().selection;
          const latex =
            selection.latex.slice(selection.startIndex, selection.endIndex) ||
            window.Calc.focusedMathQuill.mq.latex();
          if (latex) {
            navigator.clipboard
              .writeText(latex)
              .then(() => {
                this.showMessage("コピーしました");
              })
              .catch(() => {
                this.showMessage("コピーに失敗しました");
              });
          } else {
            this.showMessage("コピーする内容がありません");
          }
        } else {
          this.showMessage("MathQuillが利用できません");
        }
      } catch (error) {
        console.error("Error copying:", error);
        this.showMessage("コピーでエラーが発生しました");
      }
    }

    pasteMathExpression() {
      try {
        navigator.clipboard
          .readText()
          .then((text) => {
            if (window.Calc && window.Calc.focusedMathQuill && window.Calc.focusedMathQuill.mq) {
              window.Calc.focusedMathQuill.mq.write(text);
              // 空文字をタイプして、MathQuillの状態を更新
              window.Calc.controller.dispatch({ type: "keypad/type-text", text: "" });
              this.showMessage("ペーストしました");
            } else {
              this.showMessage("ペーストに失敗しました");
            }
          })
          .catch(() => {
            this.showMessage("ペーストに失敗しました");
          });
      } catch (error) {
        console.error("Error pasting:", error);
        this.showMessage("ペーストでエラーが発生しました");
      }
    }

    selectAllMathExpression() {
      try {
        if (window.Calc && window.Calc.focusedMathQuill && window.Calc.focusedMathQuill.mq) {
          window.Calc.focusedMathQuill.mq.select();
          this.showMessage("全選択しました");
        } else {
          this.showMessage("全選択に失敗しました");
        }
      } catch (error) {
        console.error("Error selecting all:", error);
        this.showMessage("全選択でエラーが発生しました");
      }
    }

    handleReturn() {
      try {
        window.Calc.controller.dispatch({ type: "keypad/press-key", key: "Enter" });
        this.showMessage("Enterキーが押されました");
      } catch (error) {
        console.error("Error handling return:", error);
        this.showMessage("Enterキーでエラーが発生しました");
      }
    }

    showMessage(text) {
      if (!this.isShowMessageVisible) return;
      // 簡単なトースト通知を表示
      const message = document.createElement("div");
      message.className = "dcg-custom-message";
      message.textContent = text;
      message.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #333;
        color: white;
        padding: 10px 20px;
        border-radius: 5px;
        z-index: 10000;
        font-family: Arial, sans-serif;
        font-size: 14px;
      `;
      document.body.appendChild(message);

      setTimeout(() => {
        if (message.parentNode) {
          message.parentNode.removeChild(message);
        }
      }, 2000);
    }

    hideDefaultKeyboard() {
      const defaultKeyboard = document.querySelector(
        ".dcg-keys-container .dcg-keys-background:not(.dcg-custom-mathquill-keyboard)"
      );
      if (defaultKeyboard) {
        defaultKeyboard.style.display = "none";
        defaultKeyboard.setAttribute("data-hidden-by-custom", "true");
      }
    }

    showDefaultKeyboard() {
      const defaultKeyboard = document.querySelector(
        ".dcg-keys-container .dcg-keys-background[data-hidden-by-custom='true']"
      );
      if (defaultKeyboard) {
        defaultKeyboard.style.display = "";
        defaultKeyboard.removeAttribute("data-hidden-by-custom");
      }
    }

    destroy() {
      if (this.observer) {
        this.observer.disconnect();
      }
      if (this.ariaHiddenObserver) {
        this.ariaHiddenObserver.disconnect();
      }
      if (this.customKeyboard && this.customKeyboard.parentNode) {
        this.customKeyboard.parentNode.removeChild(this.customKeyboard);
      }
      // イベントハンドラマップをクリア
      this.attachedEventHandlers.clear();
      // デフォルトキーボードを復元
      this.showDefaultKeyboard();
    }
  }

  // ページ遷移時の再初期化（SPAに対応）
  let desmosAssistant = null;
  let lastUrl = location.href;

  function initDesmosAssistant() {
    if (window.location.hostname.includes("desmos.com")) {
      desmosAssistant = new DesmosKeyboardAssistant();
    }
  }

  // 初期化
  initDesmosAssistant();

  // ページ遷移監視
  new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
      lastUrl = url;
      if (desmosAssistant) {
        desmosAssistant.destroy();
      }
      setTimeout(initDesmosAssistant, 1000);
    }
  }).observe(document, { subtree: true, childList: true });
})();
