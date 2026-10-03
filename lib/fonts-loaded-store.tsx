import React, { createContext, useContext } from "react";

const FontsLoadedContext = createContext<boolean>(false);

export function FontsLoadedProvider({
  children,
  loaded,
}: {
  children: React.ReactNode;
  loaded: boolean;
}) {
  return (
    <FontsLoadedContext.Provider value={loaded}>
      {children}
    </FontsLoadedContext.Provider>
  );
}

export function useFontsLoaded() {
  return useContext(FontsLoadedContext);
}
