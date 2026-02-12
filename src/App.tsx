import { useEffect, useMemo } from "react";
import { StarfieldCanvas } from "./components/StarfieldCanvas";
import { createMessages } from "./content/messages";
import { siteConfig } from "./content/siteConfig";

export default function App(): JSX.Element {
  const messages = useMemo(() => createMessages(siteConfig.recipientName), []);

  useEffect(() => {
    document.title = siteConfig.pageTitle;
  }, []);

  return <StarfieldCanvas messages={messages} />;
}
