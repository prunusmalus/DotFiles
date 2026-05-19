/**
 * @name Summarizer
 * @displayName Summarizer
 * @version 0.6.2
 * @author SuperTouch
 * @invite tUM6nNXXQN
 * @donate https://ko-fi.com/Z8Z2NV2H6
 * @authorId 221720773826576384
 * @source https://github.com/JanitorialMess/Summarizer
 * @updateURL https://github.com/JanitorialMess/Summarizer/releases/latest/download/Summarizer.plugin.js
 * @description **Summarize articles and YouTube videos.** Right-click on any link and select `Summarize` to extract key insights.
 */
(() => {
  var __webpack_modules__ = {
    "./src/utils/modules.js": (__unused_webpack_module, __webpack_exports__, __webpack_require__) => {
      "use strict";
      __webpack_require__.r(__webpack_exports__), __webpack_require__.d(__webpack_exports__, {
        ModuleStore: () => ModuleStore,
        pluginLoaded: () => pluginLoaded
      });
      const {React, ReactDOM, UI, ContextMenu, Net, Components: {Flex, Text, Button, TextInput}, Webpack, Logger} = window.BdApi, Stores = {
        UserStore: Webpack.getStore("UserStore"),
        MessageStore: Webpack.getStore("MessageStore"),
        ChannelStore: Webpack.getStore("ChannelStore"),
        GuildMemberStore: Webpack.getStore("GuildMemberStore")
      }, Actions = {
        MessageActions: Webpack.getByKeys("fetchMessage", "deleteMessage"),
        ModalActions: Webpack.getMangled("onCloseRequest:null!=", {
          openModal: Webpack.Filters.byStrings("onCloseRequest:null!="),
          closeModal: Webpack.Filters.byStrings(".setState", ".getState()[")
        }),
        Dispatcher: Webpack.getByKeys("actionLogger", {
          searchExports: !0
        })
      }, UIComponents = {
        DiscordButton: Webpack.getByKeys("Looks", "Colors", "Link", {
          searchExports: !0
        }),
        TextArea: Webpack.getByStrings("showRemainingCharacterCount", {
          searchExports: !0
        }),
        MessagePreview: Webpack.getModule((m => m?.type?.toString().includes("previewLinkTarget") && !m?.type?.toString().includes("THREAD_STARTER_MESSAGE"))),
        MenuStyles: Webpack.getByKeys("icon", "colorDefault", "submenu"),
        MessageStyles: Webpack.getByKeys("message", "spacingTop"),
        Scroller: Webpack.getByKeys("thin", "scrollerBase", "fade"),
        Spring: Webpack.getByKeys("useSpring", "animated"),
        Anims: Webpack.getByKeys("Easing"),
        AccessibilityContext: Webpack.getModule((m => m?._currentValue?.reducedMotion), {
          searchExports: !0
        }),
        FocusLock: Webpack.getModule((m => m?.render?.toString().includes("impressionProperties") && m?.render?.toString().includes(".Provider")), {
          searchExports: !0
        }) || React.Fragment
      }, Message = Webpack.getByPrototypeKeys("isFirstMessageInForumPost", "isSystemDM", "addReaction"), EmbedUtils = Webpack.getBySource('uniqueId("embed_")'), sanitizeEmbedFnName = EmbedUtils && Object.keys(EmbedUtils).find((k => "function" == typeof EmbedUtils[k] && EmbedUtils[k].toString().includes('uniqueId("embed_")'))), ModuleStore = {
        Dispatcher: Actions.Dispatcher,
        Flex,
        Text,
        Button,
        TextInput,
        DiscordButton: UIComponents.DiscordButton,
        TextArea: UIComponents.TextArea,
        MessagePreview: UIComponents.MessagePreview,
        MessageStyles: UIComponents.MessageStyles,
        Scroller: UIComponents.Scroller,
        Anims: UIComponents.Anims,
        Spring: UIComponents.Spring,
        FocusLock: UIComponents.FocusLock,
        MenuStyles: UIComponents.MenuStyles,
        AccessibilityContext: UIComponents.AccessibilityContext,
        React,
        ReactDOM,
        MessageStore: Stores.MessageStore,
        UserStore: Stores.UserStore,
        ChannelStore: Stores.ChannelStore,
        GuildMemberStore: Stores.GuildMemberStore,
        MessageActions: Actions.MessageActions,
        ModalActions: Actions.ModalActions,
        Net,
        UI,
        ContextMenu,
        Message,
        EmbedUtils,
        sanitizeEmbedFnName
      }, pluginLoaded = (() => {
        const missingModules = Object.entries(ModuleStore).filter((([, value]) => !value)).map((([key]) => key));
        return !(missingModules.length > 0 && (Logger.error("Summarizer", "Missing modules:", missingModules.join(", ")), 
        1));
      })();
    },
    "./node_modules/.pnpm/@babel+runtime@7.26.9/node_modules/@babel/runtime/helpers/extends.js": module => {
      function _extends() {
        return module.exports = _extends = Object.assign ? Object.assign.bind() : function(n) {
          for (var e = 1; e < arguments.length; e++) {
            var t = arguments[e];
            for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]);
          }
          return n;
        }, module.exports.__esModule = !0, module.exports.default = module.exports, _extends.apply(null, arguments);
      }
      module.exports = _extends, module.exports.__esModule = !0, module.exports.default = module.exports;
    }
  }, __webpack_module_cache__ = {};
  function __webpack_require__(moduleId) {
    var cachedModule = __webpack_module_cache__[moduleId];
    if (void 0 !== cachedModule) return cachedModule.exports;
    var module = __webpack_module_cache__[moduleId] = {
      exports: {}
    };
    return __webpack_modules__[moduleId](module, module.exports, __webpack_require__), 
    module.exports;
  }
  __webpack_require__.n = module => {
    var getter = module && module.__esModule ? () => module.default : () => module;
    return __webpack_require__.d(getter, {
      a: getter
    }), getter;
  }, __webpack_require__.d = (exports, definition) => {
    for (var key in definition) __webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key) && Object.defineProperty(exports, key, {
      enumerable: !0,
      get: definition[key]
    });
  }, __webpack_require__.o = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop), 
  __webpack_require__.r = exports => {
    "undefined" != typeof Symbol && Symbol.toStringTag && Object.defineProperty(exports, Symbol.toStringTag, {
      value: "Module"
    }), Object.defineProperty(exports, "__esModule", {
      value: !0
    });
  };
  var __webpack_exports__ = {};
  (() => {
    "use strict";
    __webpack_require__.d(__webpack_exports__, {
      default: () => Summarizer
    });
    var helpers_extends = __webpack_require__("./node_modules/.pnpm/@babel+runtime@7.26.9/node_modules/@babel/runtime/helpers/extends.js"), extends_default = __webpack_require__.n(helpers_extends);
    const src_store = {
      settingsManager: null,
      provider: null,
      selectedModel: null,
      subscribers: [],
      init(settingsManager) {
        this.settingsManager = settingsManager;
        const {providerId, selectedModels} = settingsManager.settings;
        this.provider = providerId, this.selectedModel = selectedModels[providerId];
      },
      getProvider(providerId) {
        return this.settingsManager.settings.providers.find((p => p.id === providerId));
      },
      setProvider(newProvider) {
        const providerObj = this.getProvider(newProvider), newModel = this.settingsManager.settings.selectedModels[newProvider] || providerObj.models[0]?.value;
        this.provider = newProvider, this.selectedModel = newModel, this.settingsManager.settings.providerId = newProvider, 
        this.settingsManager.settings.selectedModels[newProvider] = newModel, this.settingsManager.persist(), 
        this.notify();
      },
      setSelectedModel(newModel) {
        this.selectedModel = newModel, this.settingsManager.settings.selectedModels[this.provider] = newModel, 
        this.settingsManager.persist(), this.notify();
      },
      subscribe(callback) {
        return this.subscribers.push(callback), () => {
          this.subscribers = this.subscribers.filter((cb => cb !== callback));
        };
      },
      notify() {
        this.subscribers.forEach((cb => cb()));
      }
    };
    function capitalize(str) {
      return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }
    function formatNumericToken(token) {
      return token ? /^\d+[bB]$/.test(token) || /^\d+x\d+[bB]$/.test(token) ? token.replace(/b$/i, "B") : /^\d+$/.test(token) ? token : capitalize(token) : token;
    }
    const formatters_formatModelName = function(modelId) {
      const tokens = modelId.replace(/\bgemma2\b/gi, "gemma-2").replace(/\bllama3\b/gi, "llama-3").replace(/\blearnlm\b/gi, "LearnML").replace(/\bdeepseek\b/gi, "DeepSeek").split("-"), parts = {
        model: void 0,
        version: void 0,
        type: void 0,
        submodel: [],
        suffix: void 0,
        code: void 0
      };
      if (tokens.length > 0) {
        const m = tokens[0].match(/^([A-Za-z]+)(\d+)?$/);
        parts.model = m ? m[1] + (m[2] ? " " + m[2] : "") : tokens[0];
      }
      let idx = 1;
      tokens.length > idx && /^\d+(?:\.\d+)?$/.test(tokens[idx]) && (parts.version = tokens[idx], 
      idx++), tokens.length > idx && (parts.type = tokens[idx], idx++);
      let remaining = tokens.slice(idx);
      const suffixes = [ "latest", "preview", "exp", "experimental", "lite" ];
      if (remaining.length >= 2) {
        const candidate = remaining[remaining.length - 2].toLowerCase();
        suffixes.includes(candidate) && (parts.suffix = remaining[remaining.length - 2], 
        parts.code = remaining[remaining.length - 1], remaining = remaining.slice(0, remaining.length - 2));
      }
      if (void 0 === parts.code && remaining.length >= 2) {
        const secondLast = remaining[remaining.length - 2], last = remaining[remaining.length - 1];
        /^\d{2}$/.test(secondLast) && /^\d{2}$/.test(last) && (parts.code = secondLast + "-" + last, 
        remaining = remaining.slice(0, remaining.length - 2));
      }
      if (void 0 === parts.suffix && remaining.length > 0) {
        const candidate = remaining[remaining.length - 1].toLowerCase();
        suffixes.includes(candidate) && (parts.suffix = remaining.pop());
      }
      var token;
      parts.submodel = remaining, parts.model = (token = parts.model) ? "learnml" === token.toLowerCase() ? "LearnML" : "deepseek" === token.toLowerCase() ? "DeepSeek" : capitalize(token) : token, 
      parts.version && (parts.version = formatNumericToken(parts.version)), parts.type && (parts.type = formatNumericToken(parts.type)), 
      parts.submodel.length > 0 && (parts.submodel = parts.submodel.map((token => formatNumericToken(token)))), 
      parts.suffix && (parts.suffix = capitalize(parts.suffix));
      const result = [];
      return parts.model && result.push(parts.model), parts.version && result.push(parts.version), 
      parts.type && result.push(parts.type), parts.submodel.length > 0 && result.push(parts.submodel.join(" ")), 
      parts.suffix && result.push(parts.suffix), parts.code && result.push(parts.code), 
      result.join(" ");
    }, formatters_cleanHTMLDocument = function(doc) {
      const walker = doc.createTreeWalker(doc, NodeFilter.SHOW_COMMENT), comments = [];
      for (;walker.nextNode(); ) comments.push(walker.currentNode);
      return comments.forEach((c => c.remove())), [ "head", "script", "style", "template", "noscript", "param", "noframes", "rb", "rtc", "shadow", "xmp", "nav", "footer", "header", "aside", "menu" ].forEach((tag => {
        doc.querySelectorAll(tag).forEach((el => el.remove()));
      })), doc;
    };
    var modules = __webpack_require__("./src/utils/modules.js");
    const {Net} = modules.ModuleStore;
    class HttpError extends Error {
      constructor(message, statusCode, response) {
        super(message), this.name = "HttpError", this.statusCode = statusCode, this.response = response;
      }
    }
    class HttpClient {
      constructor(config = {}) {
        this.config = {
          baseUrl: "",
          timeout: 15e3,
          headers: {},
          parseResponse: async response => response.json(),
          ...config
        };
      }
      async fetch(url, options = {}) {
        const {baseUrl, timeout, headers: defaultHeaders, parseResponse} = this.config, {headers, body, ...requestOptions} = options, requestUrl = `${baseUrl}${url}`, requestHeaders = {
          ...defaultHeaders,
          ...headers
        }, response = await Net.fetch(requestUrl, {
          ...requestOptions,
          headers: requestHeaders,
          body: "object" == typeof body ? JSON.stringify(body) : body,
          timeout
        });
        if (!response.ok) throw new HttpError(`${response.statusText} (status: ${response.status})`, response.status, response);
        return await parseResponse(response);
      }
      async get(url, options = {}) {
        return this.fetch(url, {
          method: "GET",
          ...options
        });
      }
      async post(url, body, options = {}) {
        return this.fetch(url, {
          method: "POST",
          body,
          ...options
        });
      }
      async put(url, body, options = {}) {
        return this.fetch(url, {
          method: "PUT",
          body,
          ...options
        });
      }
      async patch(url, body, options = {}) {
        return this.fetch(url, {
          method: "PATCH",
          body,
          ...options
        });
      }
      async delete(url, options = {}) {
        return this.fetch(url, {
          method: "DELETE",
          ...options
        });
      }
    }
    const migrations = {
      "0.3.1": (settings, defaultSettings) => ({
        ...defaultSettings,
        ...Object.fromEntries([ "apiKey", "localMode", "contentProxyUrl", "userAgent" ].map((key => [ key, void 0 !== settings[key] ? settings[key] : defaultSettings[key] ])))
      }),
      "0.3.2": settings => ("google" === settings.providerId && (settings.providerId = "gemini"), 
      settings),
      "0.3.4": (settings, defaultSettings) => ({
        ...settings,
        userAgent: settings.userAgent || defaultSettings.userAgent
      }),
      "0.3.5": settings => {
        const providerId = settings.providerId, provider = settings.providers.find((_provider => _provider.id === providerId));
        return provider && (provider.apiKey = settings.apiKey), settings;
      },
      "0.3.9": (settings, defaultSettings) => (settings.modelUpdateInterval = defaultSettings.modelUpdateInterval, 
      settings.selectedModels || (settings.selectedModels = {}, settings.providers.forEach((provider => {
        provider.id === settings.providerId ? settings.selectedModels[provider.id] = settings.model || provider.models[0]?.value : settings.selectedModels[provider.id] = provider.models[0]?.value;
      }))), settings.providers.forEach((provider => {
        provider.id in settings.selectedModels || (settings.selectedModels[provider.id] = provider.models[0]?.value);
      })), "model" in settings && delete settings.model, settings.providers.forEach((provider => {
        const currentModel = settings.selectedModels[provider.id];
        !new Set(provider.models.map((m => m.value))).has(currentModel) && provider.models.length > 0 && (settings.selectedModels[provider.id] = provider.models[0].value);
      })), settings),
      "0.5.2": settings => (settings.webProxyUrl = settings.contentProxyUrl, delete settings.contentProxyUrl, 
      settings)
    };
    class SettingsManager {
      #api;
      #logger;
      #version;
      #defaultSettings;
      constructor(api, config) {
        this.#api = api, this.#logger = api.Logger, this.#version = config.info.version, 
        this.#defaultSettings = this.#getDefault(), this.settings = this.#load();
      }
      #getDefault() {
        return {
          version: this.#version,
          previewMessage: !0,
          localMode: !0,
          replaceEntireMessage: !1,
          providerId: "gemini",
          selectedModels: {
            gemini: "gemini-2.0-flash",
            groq: "mixtral-8x7b-32768"
          },
          providers: [ {
            id: "gemini",
            label: "Google Gemini",
            apiKey: "",
            models: [ {
              label: "Gemini 2.0 Flash",
              value: "gemini-2.0-flash"
            }, {
              label: "Gemini 1.5 Pro",
              value: "gemini-1.5-pro"
            }, {
              label: "Gemini 1.5 Flash",
              value: "gemini-1.5-flash"
            }, {
              label: "Gemini 1.5 Flash-8B",
              value: "gemini-1.5-flash-8b"
            } ]
          }, {
            id: "groq",
            label: "Groq",
            apiKey: "",
            models: [ {
              label: "Llama 3.3 70B",
              value: "llama-3.3-70b-versatile"
            }, {
              label: "Llama 3.1 8B",
              value: "llama-3.1-8b-instant"
            }, {
              label: "Gemma 2 9B IT",
              value: "gemma2-9b-it"
            }, {
              label: "Mixtral 8x7B",
              value: "mixtral-8x7b-32768"
            } ]
          } ],
          webProxyUrl: "",
          userAgent: "googlebot",
          supadataApiKey: "",
          ytTranscriptFallbackUrl: "",
          systemPrompt: "You are an AI assistant that summarizes articles. Provide a concise and informative summary of the given text. Do not include any additional formatting, explanations, or opinions in your response. Your summary should be in the language of origin of the article. Never add a new line between the different subsections like background and key highlights. Never ever do that. Do not add a new line after paragraphs. No return to line or separation. Follow the format to the letter when it comes to spacing.",
          summaryTemplate: "### 📰 Summary\n> **⏪ Background/Context**\n> {background}\n> **🌟 Key Highlights**\n> - {keyPoints}\n> **💡 Takeaway**\n> {takeaway:2 short paragraphs}\n",
          outputTemplate: "{{response}}\n*Disclaimer: This summary is generated by AI ({{aiName}}) and may not capture all nuances of the original article. For the most accurate and complete information, please refer to the full article.*\n{{url}}",
          temperature: .5,
          topP: .95,
          modelUpdateInterval: 432e5,
          lastModelUpdate: null
        };
      }
      #load() {
        try {
          const savedSettings = this.#api.Data.load("settings") || {}, mergedSettings = this.#api.Utils.extend(this.#defaultSettings, savedSettings);
          return this.#migrate(mergedSettings);
        } catch (error) {
          return this.#logger.error("Failed to load settings:", error), {
            ...this.#defaultSettings
          };
        }
      }
      persist() {
        try {
          this.#api.Data.save("settings", this.settings);
        } catch (error) {
          throw this.#logger.error("Failed to save settings:", error), error;
        }
      }
      #applyMigrations(settings, fromVersion, toVersion) {
        return Object.keys(migrations).filter((version => 1 === this.#api.Utils.semverCompare(fromVersion, version) && this.#api.Utils.semverCompare(version, toVersion) >= 0)).sort(((a, b) => this.#api.Utils.semverCompare(b, a))).reduce(((migratedSettings, version) => {
          this.#logger.info(`Applying migration for version ${version}`);
          try {
            return migrations[version](migratedSettings, this.#defaultSettings);
          } catch (error) {
            throw this.#logger.error(`Failed to apply migration for version ${version}:`, error), 
            error;
          }
        }), settings);
      }
      #handleMigrationError(error) {
        this.#logger.error("Migration failed. Resetting to default settings:", error), this.#api.UI.showToast("Migration failed. Resetting to default settings.", {
          type: "error"
        });
      }
      #migrate(settings) {
        const newVersion = this.#version, currentVersion = settings.version || "0.0.0";
        try {
          return this.#api.Utils.semverCompare(currentVersion, newVersion) > 0 && (this.#logger.debug("Settings need migration, applying migrations..."), 
          settings = this.#applyMigrations(settings, currentVersion, newVersion), this.#logger.debug("Migrations applied successfully")), 
          settings.version = newVersion, this.settings = settings, this.persist(), settings;
        } catch (error) {
          return this.#handleMigrationError(error), {
            ...this.#defaultSettings,
            version: newVersion
          };
        }
      }
    }
    const {ModuleStore: {React, UI}} = __webpack_require__("./src/utils/modules.js");
    class SettingsUI {
      constructor(settingsManager, store, modelUpdateCallback) {
        this.settingsManager = settingsManager, this.settings = settingsManager.settings, 
        this.store = store, this.modelUpdateCallback = modelUpdateCallback;
      }
      getLayout() {
        return [ {
          type: "category",
          id: "generalSettings",
          name: "General Settings",
          collapsible: !0,
          shown: !0,
          settings: [ {
            type: "switch",
            id: "previewMessage",
            name: "Preview Message",
            note: "When enabled, a modal will open allowing you to preview the summarized message and regenerate it before sending. When disabled, the summary is sent directly.",
            value: this.settings.previewMessage
          }, {
            type: "switch",
            id: "localMode",
            name: "Personal Mode",
            note: "When enabled, summaries are only visible to you. When disabled, summaries are visible to everyone in the chat.",
            value: this.settings.localMode
          }, {
            type: "switch",
            id: "replaceEntireMessage",
            name: "Replace Entire Message",
            note: "When enabled, replaces the original message with the summary. When disabled, keeps the original message but summaries will accumulate on top of each other when regenerating.",
            value: this.settings.replaceEntireMessage
          } ]
        }, {
          type: "category",
          id: "aiSettings",
          name: "AI Configuration",
          collapsible: !0,
          shown: !0,
          settings: [ {
            type: "custom",
            id: "providerId",
            name: "AI Provider",
            note: "Select your preferred AI service for generating summaries.",
            inline: !1,
            children: React.createElement(ProviderDropdown)
          }, {
            type: "custom",
            id: "apiKey",
            name: "API Key",
            note: "Your API key for the selected AI provider.",
            inline: !1,
            children: React.createElement(APIKeyInput)
          }, {
            type: "custom",
            id: "selectedModel",
            name: "Model",
            note: "Choose the AI model to use for summarization.",
            inline: !1,
            children: React.createElement(ModelDropdown)
          }, {
            type: "button",
            id: "updateModels",
            name: "Update Available Models",
            note: "Refresh the list of available AI models. Updates automatically every 12 hours by default.",
            color: BdApi.Components.Button.Colors.GREEN,
            style: {
              backgroundColor: "var(--green-360)"
            },
            size: BdApi.Components.Button.Sizes.SMALL,
            onClick: async () => {
              await this.modelUpdateCallback(), this.store.notify();
            },
            children: "Update Models"
          } ]
        }, {
          type: "category",
          id: "contentAccess",
          name: "Content Access Settings",
          collapsible: !0,
          shown: !1,
          settings: [ {
            type: "text",
            id: "webProxyUrl",
            name: "Web Content Proxy",
            note: React.createElement(TemplateNote, {
              message: "Optional proxy for accessing web content. Use {{url}} as placeholder for the target website link."
            }),
            value: this.settings.webProxyUrl,
            inline: !1,
            placeholder: "https://example.com/proxy?url={{url}}"
          }, {
            type: "text",
            id: "userAgent",
            name: "User Agent",
            note: "Custom user agent for web requests. Helps access certain websites.",
            value: this.settings.userAgent,
            inline: !1,
            placeholder: "Enter custom user agent..."
          }, {
            type: "text",
            id: "supadataApiKey",
            name: "YouTube Transcript API Key",
            note: React.createElement(TemplateNote, {
              message: "[[link]] API key for accessing YouTube transcripts (100 free calls/month).",
              link: {
                text: "Supadata",
                url: "https://supadata.ai/"
              }
            }),
            value: this.settings.supadataApiKey,
            inline: !1,
            placeholder: "Enter Supadata API key..."
          }, {
            type: "text",
            id: "ytTranscriptFallbackUrl",
            name: "YouTube Transcript Fallback",
            note: React.createElement(TemplateNote, {
              message: "Backup service for YouTube transcripts. Use {{videoId}} to specify the video ID. See [[link]] for self-hosting.",
              link: {
                text: "YtCaptionBridge",
                url: "https://github.com/JanitorialMess/YtCaptionBridge"
              }
            }),
            value: this.settings.ytTranscriptFallbackUrl,
            inline: !1,
            placeholder: "https://example.com/transcript?videoId={{videoId}}"
          } ]
        }, {
          type: "category",
          id: "summaryCustomization",
          name: "Summary Customization",
          collapsible: !0,
          shown: !1,
          settings: [ {
            type: "custom",
            id: "systemPrompt",
            name: "System Prompt",
            note: "Core instructions that guide how the AI generates summaries.",
            value: this.settings.systemPrompt,
            inline: !1,
            children: React.createElement(TextArea, {
              value: this.settings.systemPrompt,
              placeholder: "Enter system prompt...",
              onChange: newValue => {
                this.settings.systemPrompt = newValue, this.settingsManager.persist();
              },
              rows: 8
            })
          }, {
            type: "custom",
            id: "summaryTemplate",
            name: "Summary Format",
            note: "Template for structuring the summary content.",
            value: this.settings.summaryTemplate,
            inline: !1,
            children: React.createElement(TextArea, {
              value: this.settings.summaryTemplate,
              placeholder: "Enter summary template...",
              onChange: newValue => {
                this.settings.summaryTemplate = newValue, this.settingsManager.persist();
              },
              rows: 8
            })
          }, {
            type: "custom",
            id: "outputTemplate",
            name: "Message Format",
            note: React.createElement(TemplateNote, {
              message: "Template for the final message. Use {{response}}, {{url}}, and {{aiName}} as placeholders."
            }),
            value: this.settings.outputTemplate,
            inline: !1,
            children: React.createElement(TextArea, {
              value: this.settings.outputTemplate,
              placeholder: "Enter output template...",
              onChange: newValue => {
                this.settings.outputTemplate = newValue, this.settingsManager.persist();
              },
              rows: 4
            })
          } ]
        }, {
          type: "category",
          id: "advanced",
          name: "Advanced Settings",
          collapsible: !0,
          shown: !1,
          settings: [ {
            type: "number",
            id: "temperature",
            name: "AI Creativity (Temperature)",
            note: "Higher values (closer to 1) make summaries more creative but less focused. Lower values make them more consistent.",
            value: this.settings.temperature,
            min: 0,
            max: 1,
            step: .1
          }, {
            type: "number",
            id: "topP",
            name: "Language Diversity (Top P)",
            note: "Controls variety in word choice. Higher values allow more diverse language.",
            value: this.settings.topP,
            min: 0,
            max: 1,
            step: .05
          }, {
            type: "number",
            id: "modelUpdateInterval",
            name: "Model Update Frequency",
            note: "How often to refresh the list of available AI models (in hours).",
            value: this.settings.modelUpdateInterval / 36e5,
            min: 1,
            units: "hours"
          } ]
        } ];
      }
      buildPanel() {
        return UI.buildSettingsPanel({
          settings: this.getLayout(),
          onChange: (category, id, value) => {
            "modelUpdateInterval" === id ? (value = parseInt(value) || 12, value *= 36e5) : ("temperature" === id || "topP" === id) && (value = parseFloat(value), 
            value = Math.min(1, Math.max(0, value))), this.settings[id] = value, this.settingsManager.persist();
          }
        });
      }
    }
    const {React: useProviderModelStore_React} = modules.ModuleStore;
    function useProviderModelStore() {
      const [state, setState] = useProviderModelStore_React.useState({
        provider: src_store.provider,
        selectedModel: src_store.selectedModel
      });
      return useProviderModelStore_React.useEffect((() => src_store.subscribe((() => {
        setState({
          provider: src_store.provider,
          selectedModel: src_store.selectedModel
        });
      }))), []), {
        provider: state.provider,
        selectedModel: state.selectedModel,
        settingsManager: src_store.settingsManager,
        setProvider: newProvider => src_store.setProvider(newProvider),
        setSelectedModel: newModel => src_store.setSelectedModel(newModel)
      };
    }
    const {React: APIKeyInput_React, TextInput} = modules.ModuleStore;
    function APIKeyInput() {
      const {provider, settingsManager} = useProviderModelStore(), providerObj = settingsManager.settings.providers.find((p => p.id === provider));
      return BdApi.React.createElement(TextInput, {
        key: provider,
        value: providerObj.apiKey,
        placeholder: "Paste API key here...",
        onChange: newValue => {
          providerObj.apiKey = newValue, settingsManager.persist();
        }
      });
    }
    const {React: Dropdown_React, Scroller} = modules.ModuleStore;
    function Dropdown({value, options, onChange, disabled, style, menuStyle, showValue = !1}) {
      const selectRef = Dropdown_React.useRef(null), optionsRef = Dropdown_React.useRef(null);
      Dropdown_React.useEffect((() => {
        const selectButton = selectRef.current, optionsPopover = optionsRef.current;
        if (!selectButton || !optionsPopover) return;
        selectButton.popoverTargetElement = optionsPopover, selectButton.popoverTargetAction = "toggle";
        const observer = new IntersectionObserver((([entry]) => {
          !entry.isIntersecting && optionsPopover.isConnected && optionsPopover.togglePopover(!1);
        }));
        return observer.observe(selectButton), () => {
          observer.disconnect();
        };
      }), []);
      const selectedOption = options.find((opt => opt.value === value)) || options[0] || {};
      return BdApi.React.createElement(BdApi.React.Fragment, null, BdApi.React.createElement("button", {
        ref: selectRef,
        type: "button",
        className: `bd-select ${style || ""}${disabled ? " bd-select-disabled" : ""}`,
        disabled
      }, BdApi.React.createElement("span", {
        className: "bd-select-value"
      }, selectedOption.label), BdApi.React.createElement("svg", {
        className: "bd-select-arrow",
        fill: "currentColor",
        viewBox: "0 0 24 24",
        style: {
          width: "16px",
          height: "16px"
        }
      }, BdApi.React.createElement("path", {
        d: "M8.12 9.29L12 13.17l3.88-3.88c.39-.39 1.02-.39 1.41 0 .39.39.39 1.02 0 1.41l-4.59 4.59c-.39.39-1.02.39-1.41 0L6.7 10.7c-.39-.39-.39-1.02 0-1.41.39-.38 1.03-.39 1.42 0z"
      }))), BdApi.React.createElement("div", {
        ref: optionsRef,
        popover: "auto",
        role: "listbox",
        className: `bd-select-options ${Scroller.thin}`,
        style: {
          overflow: "auto",
          ...menuStyle
        }
      }, options.map((opt => BdApi.React.createElement("div", {
        key: opt.value,
        role: "option",
        className: "bd-select-option" + (opt.value === value ? " selected" : ""),
        onClick: () => {
          return newValue = opt.value, onChange && onChange(newValue), void (optionsRef.current && optionsRef.current.isConnected && optionsRef.current.togglePopover(!1));
          var newValue;
        },
        style: {
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start"
        }
      }, BdApi.React.createElement("div", null, opt.label), showValue && BdApi.React.createElement("div", {
        style: {
          fontSize: "0.9em",
          color: "var(--text-muted)",
          opacity: .8
        }
      }, opt.value))))));
    }
    const ModalSizes = Object.freeze({
      SMALL: "bd-modal-small",
      MEDIUM: "bd-modal-medium",
      LARGE: "bd-modal-large",
      DYNAMIC: ""
    }), {React: ModalContent_React} = modules.ModuleStore, Modal_ModalContent = ({children, scroller = !0}) => BdApi.React.createElement("div", {
      className: "bd-modal-content " + (scroller ? "bd-scroller-base bd-scroller-thin" : "")
    }, children), {React: ModalFooter_React, Flex} = modules.ModuleStore, Modal_ModalFooter = ({children, className, direction = Flex.Direction.HORIZONTAL, ...props}) => BdApi.React.createElement(Flex, extends_default()({
      className: `bd-modal-footer ${className || ""}`,
      direction,
      justify: Flex.Justify.START,
      align: Flex.Align.STRETCH,
      shrink: 0,
      grow: 0
    }, props), children), {React: ModalHeader_React, Flex: ModalHeader_Flex} = modules.ModuleStore, Modal_ModalHeader = ({children, className}) => BdApi.React.createElement(ModalHeader_Flex, {
      className: `bd-modal-header ${className || ""}`,
      direction: ModalHeader_Flex.Direction.HORIZONTAL,
      justify: ModalHeader_Flex.Justify.START,
      align: ModalHeader_Flex.Align.CENTER,
      shrink: 0,
      grow: 0
    }, children), {React: ModalRoot_React, Spring, Anims, AccessibilityContext, FocusLock} = modules.ModuleStore, Modal_ModalRoot = ({children, size = ModalSizes.DYNAMIC, className = "", transitionState = 0, style = {}, ...props}) => {
      const visible = 0 === transitionState || 1 === transitionState, preferences = ModalRoot_React.useContext(AccessibilityContext || {}), reducedMotion = preferences?.reducedMotion?.enabled || document.documentElement.classList.contains("reduce-motion"), springStyles = Spring.useSpring({
        opacity: visible ? 1 : 0,
        transform: visible || reducedMotion ? "scale(1)" : "scale(0.7)",
        config: {
          duration: visible ? 300 : 100,
          easing: visible ? Anims.Easing.inOut(Anims.Easing.back()) : Anims.Easing.quad,
          clamp: !0
        }
      });
      return BdApi.React.createElement(FocusLock, {
        disableTrack: !0
      }, BdApi.React.createElement(Spring.animated.div, extends_default()({
        className: `bd-modal-root ${size} ${className}`.trim(),
        style: {
          ...springStyles,
          ...style
        }
      }, props), children));
    }, {React: Modal_React, Text, Button} = modules.ModuleStore;
    function BaseModal({header, children, onClose, onConfirm, confirmText = "Confirm", cancelText = "Cancel", size = ModalSizes.MEDIUM, footerButtons, ...props}) {
      const confirmRef = Modal_React.useRef(null);
      Modal_React.useEffect((() => {
        setTimeout((() => confirmRef.current?.focus()), 0);
      }), []);
      const defaultFooterButtons = [ BdApi.React.createElement(Button, {
        key: "cancel",
        color: Button.Colors.PRIMARY,
        look: Button.Looks.LINK,
        onClick: onClose,
        style: {
          marginLeft: "auto"
        }
      }, cancelText), BdApi.React.createElement(Button, {
        key: "confirm",
        buttonRef: confirmRef,
        color: Button.Colors.GREEN,
        style: {
          backgroundColor: "var(--green-360)"
        },
        onClick: async () => {
          await (onConfirm?.());
        }
      }, confirmText) ];
      return BdApi.React.createElement(Modal_ModalRoot, extends_default()({
        size
      }, props), BdApi.React.createElement(Modal_ModalHeader, null, BdApi.React.createElement(Text, {
        tag: "h1",
        size: Text.Sizes.SIZE_20,
        color: Text.Colors.HEADER_PRIMARY,
        strong: !0
      }, header)), BdApi.React.createElement(Modal_ModalContent, null, children), BdApi.React.createElement(Modal_ModalFooter, {
        style: {
          overflow: "visible",
          gap: "6px"
        }
      }, footerButtons || defaultFooterButtons));
    }
    const {React: MessagePreviewModal_React, Button: MessagePreviewModal_Button, DiscordButton, Message, MessagePreview, MessageStyles, ModalActions, ChannelStore, GuildMemberStore} = modules.ModuleStore;
    function MessagePreviewModal({message, onConfirm, onRefresh, onClose, modalKey, ...props}) {
      const [content, setContent] = MessagePreviewModal_React.useState(message.content || ""), channel = MessagePreviewModal_React.useMemo((() => ChannelStore.getChannel(message.channel_id)), [ message.channel_id ]), author = MessagePreviewModal_React.useMemo((() => {
        const guildId = channel?.getGuildId();
        if (guildId) {
          const member = GuildMemberStore.getMember(guildId, message.author?.id);
          if (member) return {
            nick: member.nick,
            colorString: member.colorString,
            colorStrings: member.colorStrings,
            guildMemberAvatar: member.avatar,
            guildMemberAvatarDecoration: member.avatarDecoration,
            displayNameStyles: message.author?.displayNameStyles
          };
        }
        return {
          nick: message.author?.globalName ?? message.author?.username,
          colorString: null,
          colorStrings: null,
          displayNameStyles: message.author?.displayNameStyles
        };
      }), [ channel, message.author ]), updatedMessage = MessagePreviewModal_React.useMemo((() => {
        const newMsg = new Message(message);
        return newMsg.content = content, newMsg;
      }), [ message, content ]), footerButtons = [ BdApi.React.createElement(ProviderDropdown, {
        key: "llm-provider",
        style: "bd-scroller-thin",
        menuStyle: {
          maxHeight: "270px",
          zIndex: 1003
        }
      }), BdApi.React.createElement(ModelDropdown, {
        key: "llm-model",
        style: "bd-scroller-thin",
        menuStyle: {
          maxHeight: "270px",
          zIndex: 1003
        }
      }), BdApi.React.createElement(MessagePreviewModal_Button, {
        key: "refresh",
        color: MessagePreviewModal_Button.Colors.GREEN,
        style: {
          backgroundColor: "var(--green-360)"
        },
        onClick: async () => {
          const newContent = await (onRefresh?.());
          setContent(newContent);
        }
      }, "Regenerate"), BdApi.React.createElement(MessagePreviewModal_Button, {
        key: "cancel",
        color: MessagePreviewModal_Button.Colors.PRIMARY,
        look: MessagePreviewModal_Button.Looks.LINK,
        onClick: () => {
          onClose?.(), ModalActions.closeModal(modalKey);
        },
        style: {
          marginLeft: "auto"
        }
      }, "Cancel"), BdApi.React.createElement(DiscordButton, {
        key: "confirm",
        onClick: async () => {
          await (onConfirm?.()), ModalActions.closeModal(modalKey);
        }
      }, "Send") ];
      return BdApi.React.createElement(BaseModal, extends_default()({}, props, {
        header: "Message Preview",
        footerButtons,
        style: {
          width: "1200px",
          maxHeight: "min(960px, 60vh)",
          minHeight: "400px"
        }
      }), BdApi.React.createElement("div", {
        className: `${MessageStyles.message}`
      }, BdApi.React.createElement(MessagePreview, {
        message: updatedMessage,
        channel,
        author
      })));
    }
    const {React: ModelDropdown_React} = modules.ModuleStore;
    function ModelDropdown(props) {
      const {settingsManager, provider, selectedModel, setSelectedModel} = useProviderModelStore(), providerObj = settingsManager.settings.providers.find((p => p.id === provider)), modelOptions = providerObj ? providerObj.models : [];
      return BdApi.React.createElement(Dropdown, extends_default()({
        value: selectedModel,
        options: modelOptions,
        onChange: setSelectedModel,
        showValue: !0
      }, props));
    }
    const {React: ProviderDropdown_React} = modules.ModuleStore;
    function ProviderDropdown(props) {
      const {provider, setProvider, settingsManager} = useProviderModelStore(), providerOptions = settingsManager.settings.providers.map((p => ({
        label: p.label,
        value: p.id
      })));
      return BdApi.React.createElement(Dropdown, extends_default()({
        value: provider,
        options: providerOptions,
        onChange: setProvider
      }, props));
    }
    const {React: SparklesIcon_React} = modules.ModuleStore;
    function SparklesIcon({className = "", width = 18, height = 18, viewBox = "0 0 56 56", fill = "none", ...props}) {
      return BdApi.React.createElement("svg", extends_default()({
        className,
        "aria-hidden": "true",
        role: "img",
        xmlns: "http://www.w3.org/2000/svg",
        width,
        height,
        viewBox,
        fill
      }, props), BdApi.React.createElement("path", {
        fill: "currentColor",
        d: "M 26.6875 12.6602 C 26.9687 12.6602 27.1094 12.4961 27.1797 12.2383 C 27.9062 8.3242 27.8594 8.2305 31.9375 7.4570 C 32.2187 7.4102 32.3828 7.2461 32.3828 6.9648 C 32.3828 6.6836 32.2187 6.5195 31.9375 6.4726 C 27.8828 5.6524 28.0000 5.5586 27.1797 1.6914 C 27.1094 1.4336 26.9687 1.2695 26.6875 1.2695 C 26.4062 1.2695 26.2656 1.4336 26.1953 1.6914 C 25.3750 5.5586 25.5156 5.6524 21.4375 6.4726 C 21.1797 6.5195 20.9922 6.6836 20.9922 6.9648 C 20.9922 7.2461 21.1797 7.4102 21.4375 7.4570 C 25.5156 8.2774 25.4687 8.3242 26.1953 12.2383 C 26.2656 12.4961 26.4062 12.6602 26.6875 12.6602 Z M 15.3438 28.7852 C 15.7891 28.7852 16.0938 28.5039 16.1406 28.0821 C 16.9844 21.8242 17.1953 21.8242 23.6641 20.5821 C 24.0860 20.5117 24.3906 20.2305 24.3906 19.7852 C 24.3906 19.3633 24.0860 19.0586 23.6641 18.9883 C 17.1953 18.0977 16.9609 17.8867 16.1406 11.5117 C 16.0938 11.0899 15.7891 10.7852 15.3438 10.7852 C 14.9219 10.7852 14.6172 11.0899 14.5703 11.5352 C 13.7969 17.8164 13.4687 17.7930 7.0469 18.9883 C 6.6250 19.0821 6.3203 19.3633 6.3203 19.7852 C 6.3203 20.2539 6.6250 20.5117 7.1406 20.5821 C 13.5156 21.6133 13.7969 21.7774 14.5703 28.0352 C 14.6172 28.5039 14.9219 28.7852 15.3438 28.7852 Z M 31.2344 54.7305 C 31.8438 54.7305 32.2891 54.2852 32.4062 53.6524 C 34.0703 40.8086 35.8750 38.8633 48.5781 37.4570 C 49.2344 37.3867 49.6797 36.8945 49.6797 36.2852 C 49.6797 35.6758 49.2344 35.2070 48.5781 35.1133 C 35.8750 33.7070 34.0703 31.7617 32.4062 18.9180 C 32.2891 18.2852 31.8438 17.8633 31.2344 17.8633 C 30.6250 17.8633 30.1797 18.2852 30.0860 18.9180 C 28.4219 31.7617 26.5938 33.7070 13.9140 35.1133 C 13.2344 35.2070 12.7891 35.6758 12.7891 36.2852 C 12.7891 36.8945 13.2344 37.3867 13.9140 37.4570 C 26.5703 39.1211 28.3281 40.8321 30.0860 53.6524 C 30.1797 54.2852 30.6250 54.7305 31.2344 54.7305 Z"
      }));
    }
    function TemplateNote({message, link}) {
      const parts = message.split(/(\{\{.*?\}\}|\[\[link\]\])/g);
      return BdApi.React.createElement("span", {
        className: "bd-description"
      }, parts.map(((part, i) => /^\{\{.*?\}\}$/.test(part) ? BdApi.React.createElement("code", {
        key: i
      }, part) : "[[link]]" === part && link && link.text && link.url ? BdApi.React.createElement("a", {
        key: i,
        href: link.url,
        target: "_blank",
        rel: "noopener noreferrer"
      }, link.text) : BdApi.React.createElement("span", {
        key: i
      }, part))));
    }
    const {React: TextArea_React, TextArea: _TextArea} = modules.ModuleStore;
    function TextArea({value: initialValue, placeholder, onChange, disabled, autofocus, rows}) {
      const [value, setValue] = TextArea_React.useState(initialValue);
      return TextArea_React.useEffect((() => {
        setValue(initialValue);
      }), [ initialValue ]), BdApi.React.createElement(_TextArea, {
        value,
        placeholder,
        onChange: newValue => {
          setValue(newValue), onChange(newValue);
        },
        disabled,
        autofocus,
        rows
      });
    }
    const geminiApi = class {
      constructor(apiKey, apiVersion = "v1beta") {
        this.apiKey = apiKey, this.apiVersion = apiVersion, this.baseUrl = `https://generativelanguage.googleapis.com/${this.apiVersion}`, 
        this.httpClient = new HttpClient({
          baseUrl: this.baseUrl,
          headers: {
            "Content-Type": "application/json"
          }
        });
      }
      withApiKey(url) {
        return `${url}?key=${this.apiKey}`;
      }
      async generateContent(model, requestBody) {
        const url = this.withApiKey(`/models/${model}:generateContent`);
        return await this.httpClient.post(url, requestBody);
      }
      async listModels() {
        const url = this.withApiKey("/models");
        return (await this.httpClient.get(url)).models;
      }
      async getModel(model) {
        const url = this.withApiKey(`/models/${model}`);
        return await this.httpClient.get(url);
      }
    };
    class LLMBaseProvider {
      constructor(model, apiKey, config = {}) {
        this.model = model, this.apiKey = apiKey, this.config = config;
      }
      async invoke(messages) {
        throw new Error("invoke() must be implemented by the provider");
      }
      async getAvailableModels() {
        throw new Error("getAvailableModels() must be implemented by the provider");
      }
      async getModel(modelId) {
        throw new Error("getModel() must be implemented by the provider");
      }
      static getId() {
        throw new Error("getId() must be implemented by the provider");
      }
      static getLabel() {
        throw new Error("getLabel() must be implemented by the provider");
      }
    }
    const DEFAULT_SAFETY_SETTINGS = [ {
      category: "HARM_CATEGORY_HATE_SPEECH",
      threshold: "BLOCK_NONE"
    }, {
      category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
      threshold: "BLOCK_NONE"
    }, {
      category: "HARM_CATEGORY_HARASSMENT",
      threshold: "BLOCK_NONE"
    }, {
      category: "HARM_CATEGORY_DANGEROUS_CONTENT",
      threshold: "BLOCK_NONE"
    } ], DEFAULT_GENERATION_CONFIG = {
      temperature: .5,
      maxOutputTokens: 2048,
      topP: .95,
      topK: 10
    };
    class GeminiProvider extends LLMBaseProvider {
      static id="gemini";
      static label="Google Gemini";
      constructor(config = {}) {
        const {model, apiKey, version} = config;
        super(model, apiKey, config), this.geminiApi = new geminiApi(apiKey, version);
      }
      async invoke(messages) {
        const systemInstruction = messages.find((message => "system" === message.role))?.content || "", prompt = messages.find((message => "user" === message.role))?.content || "", options = {
          systemInstruction,
          generationConfig: {
            temperature: this.config.temperature,
            topP: this.config.topP
          }
        };
        return this.generateContent(prompt, options);
      }
      async generateContent(prompt, options = {}) {
        const requestBody = {
          contents: [ {
            parts: [ {
              text: prompt
            } ]
          } ],
          systemInstruction: {
            parts: [ {
              text: options.systemInstruction || ""
            } ]
          },
          safetySettings: options.safetySettings || DEFAULT_SAFETY_SETTINGS,
          generationConfig: {
            ...DEFAULT_GENERATION_CONFIG,
            ...options.generationConfig
          }
        };
        return (await this.geminiApi.generateContent(this.model, requestBody)).candidates[0].content.parts[0].text;
      }
      async getAvailableModels() {
        return (await this.geminiApi.listModels()).filter((model => model.supportedGenerationMethods.includes("generateContent") && model.outputTokenLimit >= 8192)).map((model => ({
          label: model.displayName,
          value: model.name.replace("models/", "")
        }))).sort(((a, b) => a.label.localeCompare(b.label)));
      }
      async getModel(modelId) {
        return await this.geminiApi.getModel(modelId);
      }
      static getId() {
        return GeminiProvider.id;
      }
      static getLabel() {
        return GeminiProvider.label;
      }
    }
    const groqApi = class {
      constructor(apiKey, apiVersion = "v1") {
        this.apiKey = apiKey, this.apiVersion = apiVersion, this.baseURL = `https://api.groq.com/openai/${this.apiVersion}`, 
        this.httpClient = new HttpClient({
          baseUrl: this.baseURL,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`
          }
        });
      }
      async listModels() {
        return (await this.httpClient.get("/models")).data;
      }
      async getModel(model) {
        return await this.httpClient.get(`/models/${model}`);
      }
      async createChatCompletion(params) {
        return await this.httpClient.post("/chat/completions", params);
      }
    }, groqProvider_DEFAULT_GENERATION_CONFIG = {
      temperature: .5,
      max_completion_tokens: 2048,
      top_p: .95
    };
    class GroqProvider extends LLMBaseProvider {
      static id="groq";
      static label="Groq";
      constructor(config = {}) {
        const {model, apiKey, version} = config;
        super(model, apiKey, config), this.groqAPI = new groqApi(apiKey, version);
      }
      async invoke(messages) {
        const options = {
          messages,
          temperature: this.config.temperature,
          top_p: this.config.topP
        };
        return this.generateContent(options);
      }
      async generateContent(options = {}) {
        const generationConfig = {
          ...groqProvider_DEFAULT_GENERATION_CONFIG,
          ...options
        }, requestBody = {
          model: this.model,
          ...generationConfig
        };
        return (await this.groqAPI.createChatCompletion(requestBody)).choices[0].message.content;
      }
      async getAvailableModels() {
        return (await this.groqAPI.listModels()).filter((model => model.active && model.context_window >= 8192 && "playai" !== model.owned_by.toLowerCase())).map((model => ({
          label: formatters_formatModelName(model.id),
          value: model.id
        }))).sort(((a, b) => a.label.localeCompare(b.label)));
      }
      async getModel(model) {
        return await this.groqAPI.getModel(model);
      }
      static getId() {
        return GroqProvider.id;
      }
      static getLabel() {
        return GroqProvider.label;
      }
    }
    class TranscriptProvider {
      async getTranscript(videoId, url) {
        throw new Error("Method not implemented");
      }
    }
    class SupadataTranscriptProvider extends TranscriptProvider {
      SUPADATA_API_URL="https://api.supadata.ai/v1/youtube/transcript";
      constructor(apiKey, httpClient) {
        super(), this.apiKey = apiKey, this.httpClient = httpClient;
      }
      async getTranscript(videoId) {
        const params = new URLSearchParams({
          videoId,
          text: !0
        }), transcriptUrl = `${this.SUPADATA_API_URL}?${params}`, data = await this.httpClient.get(transcriptUrl, {
          headers: {
            "X-API-KEY": this.apiKey
          }
        });
        if (!data?.content) throw new Error("Transcript not found in Supadata response");
        return data.content;
      }
    }
    class FallbackTranscriptProvider extends TranscriptProvider {
      constructor(fallbackUrlTemplate, httpClient) {
        super(), this.fallbackUrlTemplate = fallbackUrlTemplate, this.httpClient = httpClient;
      }
      async getTranscript(videoId, url) {
        const fallbackUrl = this.fallbackUrlTemplate.replace("{{url}}", url).replace("{{videoId}}", videoId), data = await this.httpClient.get(fallbackUrl);
        if (!data?.transcript) throw new Error("Transcript not found in fallback response");
        return data.transcript;
      }
    }
    class LLMProviderFactory {
      static createProvider(providerId, config = {}) {
        return new (this.getProviderClass(providerId))(config);
      }
      static getProviderClass(providerId) {
        const provider = this.getAvailableProviders().find((p => p.id === providerId));
        if (!provider) throw new Error("Invalid provider ID");
        return provider.classRef;
      }
      static getAvailableProviders() {
        return [ {
          id: GeminiProvider.getId(),
          label: GeminiProvider.getLabel(),
          classRef: GeminiProvider
        }, {
          id: GroqProvider.getId(),
          label: GroqProvider.getLabel(),
          classRef: GroqProvider
        } ];
      }
    }
    /*
 * MIT License
 *
 * Original work Copyright (c) 2017 Dom Christie
 * Modified work Copyright (c) 2025 JanitorialMess
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 */
    class HTMLTextParserService {
      constructor(options = {}) {
        const defaults = {
          rules: {
            ...HTMLTextParserService.rules
          },
          preserveNewlines: !0,
          preserveLinks: !1,
          defaultReplacement: (content, node) => HTMLTextParserService.isBlock(node) ? `\n${content}\n` : content
        };
        this.options = {
          ...defaults,
          ...options
        }, this.options.rules.link && (this.options.rules.link.replacement = function(content) {
          return this.options.preserveLinks ? content : "";
        }), this.rules = this.options.rules;
      }
      extract(input) {
        if (!this.canConvert(input)) throw new TypeError(`${input} is not a string, or an element/document/fragment node.`);
        if ("" === input) return "";
        const root = HTMLTextParserService.createRootNode(input), output = this.process(root);
        return this.postProcess(output);
      }
      process(parentNode) {
        return Array.from(parentNode.childNodes).reduce(((output, node) => {
          let replacement = "";
          if (3 === node.nodeType) replacement = node.textContent; else if (1 === node.nodeType) {
            const rule = this.findRule(node), content = this.process(node);
            replacement = rule ? rule.replacement.call(this, content, node) : this.options.defaultReplacement(content, node);
          }
          return this.join(output, replacement);
        }), "");
      }
      findRule(node) {
        for (const key in this.rules) {
          const rule = this.rules[key], filter = rule.filter;
          if ("string" == typeof filter && filter === node.nodeName.toLowerCase() || Array.isArray(filter) && filter.includes(node.nodeName.toLowerCase())) return rule;
        }
        return null;
      }
      join(output, replacement) {
        const shouldAddSpacing = this.options.preserveNewlines || output.length > 0 && replacement.length > 0;
        return HTMLTextParserService.trimTrailingNewlines(output) + (shouldAddSpacing ? " " : "") + HTMLTextParserService.trimLeadingNewlines(replacement);
      }
      postProcess(output) {
        return output.replace(/\n\s+\n/g, "\n\n").replace(/\n{3,}/g, "\n\n").replace(/[ \t]+/g, " ").trim();
      }
      canConvert(input) {
        return null != input && ("string" == typeof input || input.nodeType && [ 1, 9, 11 ].includes(input.nodeType));
      }
      static createRootNode(input) {
        if ("string" == typeof input) {
          const doc = (new DOMParser).parseFromString(`<div id="text-root">${input}</div>`, "text/html");
          return formatters_cleanHTMLDocument(doc), doc.getElementById("text-root");
        }
        const cloned = input.cloneNode(!0);
        return 9 === cloned.nodeType ? formatters_cleanHTMLDocument(cloned) : cloned.ownerDocument && formatters_cleanHTMLDocument(cloned.ownerDocument), 
        cloned;
      }
      static trimLeadingNewlines(string) {
        return string.replace(/^\n*/, "");
      }
      static trimTrailingNewlines(string) {
        let indexEnd = string.length;
        for (;indexEnd > 0 && "\n" === string[indexEnd - 1]; ) indexEnd--;
        return string.substring(0, indexEnd);
      }
      static isBlock(node) {
        return HTMLTextParserService.blockElements.includes(node.nodeName);
      }
      static blockElements=[ "ADDRESS", "ARTICLE", "ASIDE", "BLOCKQUOTE", "BODY", "DD", "DIV", "DL", "DT", "FIELDSET", "FIGCAPTION", "FIGURE", "FOOTER", "FORM", "H1", "H2", "H3", "H4", "H5", "H6", "HEADER", "HR", "LI", "MAIN", "NAV", "OL", "P", "PRE", "SECTION", "TABLE", "TBODY", "TD", "TFOOT", "TH", "THEAD", "TR", "UL" ];
      static rules={
        nonContentElements: {
          filter: [ "nav", "footer", "header", "aside", "menu" ],
          replacement: () => ""
        },
        link: {
          filter: "a",
          replacement: function(content) {
            return this.options.preserveLinks ? content : "";
          }
        },
        paragraph: {
          filter: "p",
          replacement: content => `\n${content}\n`
        },
        lineBreak: {
          filter: "br",
          replacement: () => "\n"
        },
        heading: {
          filter: [ "h1", "h2", "h3", "h4", "h5", "h6" ],
          replacement: content => `\n${content}\n`
        },
        list: {
          filter: [ "ul", "ol" ],
          replacement: content => `\n${content}\n`
        },
        listItem: {
          filter: "li",
          replacement: (content, node) => {
            const parent = node.parentNode;
            return `${"OL" === parent.nodeName ? `${Array.prototype.indexOf.call(parent.children, node) + 1}. ` : "• "}${content}\n`;
          }
        },
        table: {
          filter: "table",
          replacement: content => `\n${content}\n`
        },
        tableRow: {
          filter: "tr",
          replacement: content => `${content}\n`
        },
        tableCell: {
          filter: [ "th", "td" ],
          replacement: content => `${content}\t`
        }
      };
    }
    const YOUTUBE_REGEX = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    class YouTubeTranscriptService {
      constructor(settings) {
        this.httpClient = new HttpClient({
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
          }
        }), this.providers = this.initializeProviders(settings);
      }
      extractVideoId(url) {
        const match = url?.match(YOUTUBE_REGEX);
        return match ? match[1] : null;
      }
      static isValidUrl(url) {
        return Boolean(url && YOUTUBE_REGEX.test(url));
      }
      initializeProviders(settings) {
        const providers = [];
        return settings?.supadataApiKey && providers.push(new SupadataTranscriptProvider(settings.supadataApiKey, this.httpClient)), 
        settings?.ytTranscriptFallbackUrl && providers.push(new FallbackTranscriptProvider(settings.ytTranscriptFallbackUrl, this.httpClient)), 
        providers;
      }
      async fetchTranscript(url) {
        const videoId = this.extractVideoId(url);
        if (!videoId) throw new Error("Invalid YouTube URL");
        if (0 === this.providers.length) throw new Error("No transcript providers configured");
        let lastError;
        for (const provider of this.providers) try {
          return await provider.getTranscript(videoId, url);
        } catch (error) {
          lastError = error;
          continue;
        }
        throw new Error(`Failed to fetch transcript: ${lastError.message}`);
      }
    }
    const services_summarizer = class {
      constructor(LLMProviderFactory, settings) {
        this.settings = settings, this.provider = this.createProvider(LLMProviderFactory), 
        this.youtubeTranscriptService = new YouTubeTranscriptService(settings), this.httpClient = new HttpClient({
          headers: {
            "User-Agent": this.settings.userAgent || "Robot/1.0.0 (+http://search.mobilesl.com/robot)"
          },
          parseResponse: async response => response
        });
      }
      createProvider(LLMProviderFactory) {
        const {providerId, providers} = this.settings, provider = providers.find((_provider => _provider.id === providerId)), userConfig = {
          temperature: this.settings.temperature,
          topP: this.settings.topP,
          model: this.settings.selectedModels[providerId],
          apiKey: provider?.apiKey
        };
        if (!provider?.apiKey) throw new Error(`API key not found for provider: ${providerId}`);
        return LLMProviderFactory.createProvider(providerId, userConfig);
      }
      generateQuery(text) {
        const {summaryTemplate} = this.settings;
        return `Please summarize the following article using the provided template:\nTemplate:\n${summaryTemplate}\n\nArticle Content:\n${text}\n\nSummary:\n`;
      }
      async summarize(url) {
        try {
          const contentText = await this.retrieveContent(url);
          if (!contentText) throw new Error("Failed to fetch article text.");
          return await this.generateSummary(url, contentText);
        } catch (error) {
          return Promise.reject(error);
        }
      }
      async generateSummary(url, text) {
        const response = await this.provider.invoke([ {
          role: "system",
          content: this.settings.systemPrompt
        }, {
          role: "user",
          content: this.generateQuery(text)
        } ]);
        return this.settings.outputTemplate.replaceAll("{{response}}", response.trim()).replaceAll("{{url}}", url).replaceAll("{{aiName}}", this.provider.model).replaceAll("{{link}}", url);
      }
      async retrieveContent(url) {
        if (YouTubeTranscriptService.isValidUrl(url)) try {
          return await this.youtubeTranscriptService.fetchTranscript(url);
        } catch (error) {
          throw new Error(`Failed to fetch YouTube transcript | ${error.message}`);
        }
        try {
          const urlToFetch = this.settings.webProxyUrl ? this.settings.webProxyUrl.replace("{{url}}", url) : url, response = await this.httpClient.get(urlToFetch), html = await response.text(), doc = (new DOMParser).parseFromString(html, "text/html"), pageText = (new HTMLTextParserService).extract(doc);
          if (pageText) return pageText.trim();
          throw new Error("Failed to extract article content");
        } catch (error) {
          throw new Error(`Failed to fetching article text - ${error.message}`);
        }
      }
    }, config_namespaceObject = JSON.parse('{"name":"Summarizer","version":"0.6.2"}'), {React: src_React, Dispatcher, ContextMenu, EmbedUtils, MenuStyles, UserStore, Message: src_Message, MessageStore, MessageActions, ModalActions: src_ModalActions, sanitizeEmbedFnName} = modules.ModuleStore, config = {
      info: {
        name: config_namespaceObject.name,
        version: config_namespaceObject.version
      },
      changelog: [],
      main: "Summarizer.plugin.js"
    };
    class Summarizer {
      constructor() {
        this.api = new BdApi(config.info.name), this.logger = this.api.Logger, this.settingsManager = new SettingsManager(this.api, config), 
        this.settings = this.settingsManager.settings, src_store.init(this.settingsManager), 
        this.settingPanel = new SettingsUI(this.settingsManager, src_store, (async () => {
          await this.updateProviderModels();
        }));
      }
      async start() {
        try {
          (!this.settings.lastModelUpdate || Date.now() - this.settings.lastModelUpdate > this.settings.modelUpdateInterval) && (this.logger.log("Checking for model updates..."), 
          await this.updateProviderModels(), this.logger.log("Model update check complete.")), 
          this.api.Patcher.instead(EmbedUtils, sanitizeEmbedFnName, this.embedUtilsPatch), 
          ContextMenu.patch("message", this.messageContextPatch);
        } catch (error) {
          this.logger.error("Failed to start plugin:", error);
        }
      }
      embedUtilsPatch=(thisObject, args, originalFunction) => {
        const [channelId, messageId, embed] = args;
        if (embed?.hasOwnProperty("contentScanVersion")) {
          const message = MessageStore.getMessage(channelId, messageId);
          if (message && this.needsLocalUpdate(message)) return embed;
        }
        return originalFunction(...args);
      };
      messageContextPatch=(ret, props) => {
        const message = MessageStore.getMessage(props.channel.id, props.message.id);
        if (!message || !message.content) return;
        const link = props.target?.closest("a")?.href;
        link && ret.props.children.props.children.push(ContextMenu.buildItem({
          type: "separator"
        }), ContextMenu.buildItem({
          label: "Summarize",
          action: () => {
            this.summarizeArticle(message, link);
          },
          color: "premium",
          icon: () => src_React.createElement(SparklesIcon, {
            className: MenuStyles.icon
          })
        }));
      };
      async updateProviderModels() {
        let providerUpdatedCount = 0;
        for (const provider of this.settings.providers) if (provider.apiKey) try {
          this.logger.info(`Updating models for provider ${provider.id}...`);
          const userConfig = {
            apiKey: provider?.apiKey
          }, providerInstance = LLMProviderFactory.createProvider(provider.id, userConfig);
          if (!providerInstance.getAvailableModels) continue;
          const availableModels = await providerInstance.getAvailableModels();
          if (JSON.stringify(availableModels) !== JSON.stringify(provider.models)) {
            provider.models = availableModels;
            const currentSelectedModel = this.settings.selectedModels[provider.id];
            !availableModels.some((m => m.value === currentSelectedModel)) && availableModels.length > 0 && (this.settings.selectedModels[provider.id] = availableModels[0].value);
          }
          providerUpdatedCount++;
        } catch (error) {
          this.logger.warn(`Failed to update models for provider ${provider.id}:`, error);
        } else this.logger.warn(`API key not found for provider ${provider.id}, skipping model list update`);
        providerUpdatedCount === this.settings.providers.length ? (this.api.UI.showToast("Models updated!", {
          type: "success"
        }), this.settings.lastModelUpdate = Date.now(), this.settingsManager.persist()) : providerUpdatedCount > 0 ? this.api.UI.showToast("Some models failed to update", {
          type: "warning"
        }) : this.api.UI.showToast("No models updated, check your API keys", {
          type: "info"
        });
      }
      async generateSummary(url) {
        const summarizer = new services_summarizer(LLMProviderFactory, this.settings);
        return await summarizer.summarize(url);
      }
      mergeSummary(originalContent, summary, url) {
        return this.settings.replaceEntireMessage ? summary : originalContent.replace(url, summary);
      }
      needsLocalUpdate(message) {
        return this.settings.localMode || message.author.id !== UserStore.getCurrentUser().id;
      }
      async updateLocalMessage(message, newContent) {
        message.content = newContent, Dispatcher.dispatch({
          type: "MESSAGE_UPDATE",
          message
        });
      }
      async updateRemoteMessage(message, newContent) {
        await MessageActions.editMessage(message.channel_id, message.id, {
          content: newContent
        });
      }
      async sendMessage(message, newContent) {
        this.needsLocalUpdate(message) ? await this.updateLocalMessage(message, newContent) : await this.updateRemoteMessage(message, newContent);
      }
      openMessagePreviewModal(message, onConfirm, onRefresh, onClose) {
        const modalKey = src_ModalActions.openModal((props => BdApi.React.createElement(MessagePreviewModal, extends_default()({}, props, {
          modalKey,
          message,
          onConfirm,
          onRefresh,
          onClose
        }))));
        return modalKey;
      }
      async openPreviewModal(originalMessage, originalContent, newMessage, url) {
        return this.openMessagePreviewModal(newMessage, (async () => {
          await this.sendMessage(originalMessage, newMessage.content), this.api.UI.showToast("Sent!", {
            type: "success"
          });
        }), (async () => {
          try {
            this.api.UI.showToast("Regenerating...", {
              type: "warning",
              timeout: 2e3
            });
            const newSummary = await this.generateSummary(url), refreshedContent = this.mergeSummary(originalContent, newSummary, url);
            return newMessage.content = refreshedContent, refreshedContent;
          } catch (error) {
            this.handleError(error);
          }
        }), (() => {}));
      }
      async summarizeArticle(message, url) {
        try {
          this.api.UI.showToast("Summarizing...", {
            type: "warning",
            timeout: 4e3
          });
          const originalContent = message.content, newMessage = new src_Message(message), summary = await this.generateSummary(url), newContent = this.mergeSummary(originalContent, summary, url);
          newMessage.content = newContent, this.settings.previewMessage ? await this.openPreviewModal(message, originalContent, newMessage, url) : await this.sendMessage(message, newContent), 
          this.api.UI.showToast("Summarized successfully!", {
            type: "success"
          });
        } catch (error) {
          this.handleError(error);
        }
      }
      handleError(error) {
        this.logger.error(error);
        let errorMessage = "Failed to summarize article. Please try again.";
        errorMessage = error.message.includes("API request failed") || error.message.includes("Invalid API key") ? "Failed to summarize article. Please check your API key." : error.message.includes("Failed to fetch article content") ? "Failed to fetch article content. Please check the URL." : error.message.includes("Failed to fetch YouTube transcript") ? "Supadata API key or Fallback URL required for YouTube." : error.message.includes("Invalid settings.") ? "Invalid plugin settings detected. Please check your configuration." : error.message || String(error), 
        this.api.UI.showToast(errorMessage, {
          type: "error"
        });
      }
      stop() {
        ContextMenu.unpatch("message", this.messageContextPatch), this.api.Patcher.unpatchAll();
      }
      getSettingsPanel() {
        return this.settingPanel.buildPanel();
      }
    }
  })(), module.exports = __webpack_exports__.default;
})();