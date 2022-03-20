import { invoke } from "@tauri-apps/api";
import { useEffect, useState } from "react";
import { AppState, Commands, getConfig } from "../utils";
const Filepath = () => {
  const [appState, setAppState] = useState<AppState | undefined>();

  const updateState = () => {
    getConfig().then((data) => setAppState(data));
  };
  useEffect(() => {
    updateState();
  }, []);

  const updateConfigPath = () => {
    invoke(Commands.UpdateConfigPath).then(updateState);
  };
  return (
    <>
      <label>
        Config Path: <b>{appState?.app_config.user_config_path}</b>
      </label>
      <div>
        <button onClick={updateConfigPath}>Set custom config file path</button>
      </div>
    </>
  );
};

export default Filepath;
