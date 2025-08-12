import { useEffect, useState, useMemo } from "react";
import {
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  Link,
  Divider,
  hubspot,
  Flex,
  Button,
  Icon
} from '@hubspot/ui-extensions';

// Đăng ký extension với HubSpot CRM
hubspot.extend(({ actions, context }) => <Extension context={context} openIframe={actions.openIframeModal} />);

const Extension = ({ openIframe, context }) => {

  // Compute parameters once using useMemo to avoid repetition
  const params = useMemo(() => {
    const rawType = context.crm.objectTypeId;
    const type = rawType === "0-3" ? "DEAL" : rawType === "0-1" ? "CONTACT" : rawType;
    return {
      type,
      objectId: context.crm.objectId,
      portalId: context.portal.id
    };
  }, [context]);


  const handleOpenWorkspace = () => {
    const { type, objectId, portalId } = params;
    const baseUri = `http://localhost:5173`;
    const query = new URLSearchParams({ type, objectId, portalId }).toString();
    const iframeUrl = `${baseUri}?${query}`;

    openIframe({
      uri: iframeUrl,
      width: 1000,
      height: 1000,
      title: "AI Chatbot and Email Writer by Nexce.io",
      flush: true,
    });
  };


  return (
    <Flex direction="column" gap="medium">
      <Flex align="center" gap="medium" justify="center">
        <Button size="sm" variant="primary" onClick={handleOpenWorkspace}>
          Open workspace
        </Button>
        <Button size="sm" variant="secondary" type="button" href={{ url: "https://wikipedia.org", external: true }}>
          User guide
        </Button>
        <Button size="sm" variant="secondary" type="button" href={{ url: "https://wikipedia.org", external: true }}>
          Billing
        </Button>
        <Button size="sm" variant="secondary" type="button" href={{ url: "https://wikipedia.org", external: true }}>
          Contact support
        </Button>
      </Flex>
    </Flex>
  );
};

export default Extension;