"use client";

import { useState } from "react";
import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client/core";
import { ApolloProvider } from "@apollo/client/react";

export function ApolloAppProvider({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new ApolloClient({
        link: new HttpLink({ uri: "/api/graphql" }),
        cache: new InMemoryCache(),
      }),
  );

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
