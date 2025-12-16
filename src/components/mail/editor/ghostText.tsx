import { NodeViewWrapper, NodeViewContent, type NodeViewProps } from "@tiptap/react";
import React from "react";

const GhostText = (props: NodeViewProps) => {
  return (
    <NodeViewWrapper as="span">
      <NodeViewContent className="!inline select-none text-gray-300" as="div">
        {(props.node.attrs as { content?: string }).content}
      </NodeViewContent>
    </NodeViewWrapper>
  );
};

GhostText.displayName = "GhostText";

export default GhostText;
