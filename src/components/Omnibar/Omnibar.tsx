import { appWindow } from "@tauri-apps/api/window";
import { useEffect, useState } from "react";
import { Autocomplete } from "../Autocomplete";
import { AppEvents, getConfig } from "../../utils";
import createWorkflowSource from "./workflow-source";
import createSettingsSource from "./settings-source";
import createWebSearchSource, { searchEngines } from "./websearch-source";

const focusSearchBar = () => {
  let input = document.querySelector(".aa-Input") as HTMLElement | null;
  input?.focus();
};

function getQueryPattern(query: string, flags = "i") {
  const pattern = new RegExp(
    `(${query
      .trim() // Trim leading and ending whitespace
      .toLowerCase() // convert to lower case
      .split(" ") // Split on spaces for multiple commands
      .map((token) => `^${token}`) // Map over the resulting array and create Regex_
      .join("|")})`, // Join those expressions with an OR |
    flags
  );

  return pattern;
}

// function highlight(text: string, pattern: RegExp) {
//   // Split the text based on the pattern
//   const tokens = text.split(pattern);

//   // Map over the split text and test against the pattern
//   return tokens.map((token) => {
//     // If the pattern matches the text, wrap the text in <mark>
//     if (!pattern.test("") && pattern.test(token)) {
//       return <mark>{token}</mark>;
//     }

//     // return the token back to the array
//     return token;
//   });
// }

const Omnibar = () => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  async function setStoredConfigChoices() {
    let state = await getConfig();
    setSuggestions(state.user_config.workflows.map((wf) => wf.name));
  }
  useEffect(() => {
    const unlisten1 = appWindow.listen(
      AppEvents.OmnibarFocused,
      focusSearchBar
    );
    const unlisten2 = appWindow.listen(
      AppEvents.AppStateUpdated,
      setStoredConfigChoices
    );

    return () => {
      unlisten1();
      unlisten2();
    };
  }, []);

  useEffect(() => {
    setStoredConfigChoices();
  }, []);

  return (
    <div style={{ background: "rgb(0 0 0 / 0%)" }}>
      <form>
        <Autocomplete
          placeholder=""
          openOnFocus
          autoFocus
          defaultActiveItemId={0}
          getSources={({ query }: { query: string }) => {
            const pattern = getQueryPattern(query);
            const webSearchSource = createWebSearchSource({ query });
            const defaultSources = [
              createWorkflowSource({ suggestions, pattern }),
              createSettingsSource({ pattern }),
              webSearchSource,
            ];
            const searchEngineCodes = searchEngines.map((se) => se.shortCode);
            const isWebSearch =
              query.includes("?") &&
              searchEngineCodes.some((v: string) => query.includes(v));

            return isWebSearch ? [webSearchSource] : defaultSources;
          }}
        />
      </form>
    </div>
  );
};

export default Omnibar;
