import React, { useEffect, useState } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import { FrontendAnchorGateway } from "../../../../anchors";
import {
  currentNodeState,
  refreshAnchorState,
  refreshLinkListState,
  refreshState,
  selectedExtentState,
} from "../../../../global/Atoms";
import { FrontendLinkGateway } from "../../../../links";
import { FrontendNodeGateway } from "../../../../nodes";
import {
  Extent,
  INode,
  INodeProperty,
  IRecipeNode,
  IServiceResponse,
  NodeIdsToNodesMap,
  failureServiceResponse,
  makeINodeProperty,
  makeITextExtent,
  successfulServiceResponse,
} from "../../../../types";
import "./TextContent.scss";
import { TextMenu } from "./TextMenu";
import { Link } from "@tiptap/extension-link";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Highlight from "@tiptap/extension-highlight";
import Underline from "@tiptap/extension-underline";
import { loadAnchorToLinksMap } from "../../NodeLinkMenu";
import TextAlign from "@tiptap/extension-text-align";
import { join } from "path";
import BulletList from "@tiptap/extension-bullet-list";
import ListItem from "@tiptap/extension-list-item";
import OrderedList from "@tiptap/extension-ordered-list";

export interface INodeLinkMenuProps {
  nodeIdsToNodesMap: NodeIdsToNodesMap;
  currentNode: INode;
}

/** The content of an text node, including all its anchors */
export const TextContent = (props: INodeLinkMenuProps) => {
  const { currentNode } = props;
  const [refresh] = useRecoilState(refreshState);
  const setCurrentNode = useSetRecoilState(currentNodeState);
  const [anchorRefresh, setAnchorRefresh] = useRecoilState(refreshAnchorState);
  const [linkMenuRefresh, setLinkMenuRefresh] =
    useRecoilState(refreshLinkListState);
  const [editing, setEditing] = useState(false);
  const setSelectedExtent = useSetRecoilState(selectedExtentState);

  useEffect(() => {
    console.log(editing);
    console.log(currentNode?.title);
  }, [editing]);

  //editor and all extensions are added here
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: true,
        autolink: false,
        linkOnPaste: false,
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Highlight,
      Underline,
      BulletList,
      ListItem,
      OrderedList,
    ],
    content: currentNode?.content,
  });

  // TODO: Add all of the functionality for a rich text editor!
  // (This file is where the majority of your work on text editing will be done)

  /** This function adds anchor marks for anchors in the database to the text editor */
  const addAnchorMarks = async (): Promise<IServiceResponse<any>> => {
    if (!editor) {
      return failureServiceResponse("no editor");
    }
    const anchorResponse = await FrontendAnchorGateway.getAnchorsByNodeId(
      currentNode?.nodeId
    );
    console.log(anchorResponse.payload, "payload");
    if (!anchorResponse || !anchorResponse.success) {
      return failureServiceResponse("failed to get anchors");
    }

    if (!anchorResponse.payload) {
      return successfulServiceResponse("no anchors to add");
    }
    for (let i = 0; i < anchorResponse.payload?.length; i++) {
      const anchor = anchorResponse.payload[i];
      const linkResponse = await FrontendLinkGateway.getLinksByAnchorId(
        anchor.anchorId
      );
      console.log(linkResponse.payload);
      if (!linkResponse.success) {
        return failureServiceResponse("failed to get link");
      }
      const link = linkResponse.payload[0];
      let node = link.anchor1NodeId;
      if (node == currentNode.nodeId) {
        node = link.anchor2NodeId;
      }
      if (anchor.extent && anchor.extent.type == "text") {
        editor.commands.setTextSelection({
          from: anchor.extent.startCharacter + 1,
          to: anchor.extent.endCharacter + 1,
        });
        editor.commands.setLink({
          href: "/" + node + "/",
          target: anchor.anchorId,
        });
      }
    }
    return successfulServiceResponse("added anchors");
  };

  // Set the content and add anchor marks when this component loads
  useEffect(() => {
    if (editor) {
      editor.commands.setContent(currentNode?.content);
      addAnchorMarks();
    }
  }, [currentNode, editor, refresh]);

  // Set the selected extent to null when this component loads
  useEffect(() => {
    setSelectedExtent(null);
  }, [currentNode]);

  /**
   * Helper function that finds all anchor marks from the editor and adds
   * to the anchorIDtoExtent map as well as finding what anchors exist
   * in the editor
   * @param anchorIDToExtent map of anchorIds to their extents
   * @param editorAnchorIds anchor IDs present in the editor
   */
  const findAnchorMarks = async (
    anchorIDToExtent: Map<string, Extent>,
    editorAnchorIds: string[]
  ) => {
    editor?.state?.doc?.descendants(function (node, pos) {
      node.marks.forEach((mark) => {
        console.log(mark);
        const target: string = mark.attrs.target;
        if (mark.type.name === "link" && target.includes("anchor")) {
          editorAnchorIds.push(target);
          const text = node.text ?? "";
          const extent: Extent = makeITextExtent(
            text,
            pos - 1,
            pos - 1 + text.length
          );
          console.log(extent);
          anchorIDToExtent.set(target, extent);
        }
      });
    });
    anchorIDToExtent.forEach(async (extent: Extent, anchorID: string) => {
      await FrontendAnchorGateway.updateExtent(anchorID, extent);
    });
  };

  /**
   * Method that handles any change of content, calls helpers to achieve
   * the full functionality.
   */
  const handleContentChange = async () => {
    const anchorIDToExtent = new Map();
    const editorAnchorIds: string[] = [];

    findAnchorMarks(anchorIDToExtent, editorAnchorIds);

    const nodeAnchorIdsResp = await FrontendAnchorGateway.getAnchorsByNodeId(
      currentNode?.nodeId
    );
    let anchorsToDelete: string[] = [];
    const linksToDelete: any[] = [];
    if (nodeAnchorIdsResp.success) {
      const nodeAnchorIds = nodeAnchorIdsResp.payload
        .filter((anchor) => anchor.extent !== null) // Filter out elements with non-null extent
        .map((anchor) => anchor.anchorId);
      if (nodeAnchorIds) {
        anchorsToDelete = nodeAnchorIds.filter(
          (nodeAnchorId) => !editorAnchorIds.includes(nodeAnchorId) //and the corresponding anchor doesn't have null extent
        );
      }
    } else {
      console.log(nodeAnchorIdsResp.message);
    }

    const anchorsToLinksMap = await loadAnchorToLinksMap({
      ...props,
      currentNode,
    });
    //finding links to delete based on anchors to delete
    anchorsToDelete.forEach((anchorId) => {
      anchorsToLinksMap[anchorId].links.forEach((link) => {
        !linksToDelete.includes(link.link.linkId) &&
          linksToDelete.push(link.link.linkId);
        !anchorsToDelete.includes(link.oppAnchor.anchorId) &&
          anchorsToDelete.push(link.oppAnchor.anchorId);
      });
    });
    console.log(anchorsToDelete, linksToDelete);

    //delete the links associated with the deleted anchors
    const deleteLinkResp =
      linksToDelete.length > 0
        ? await FrontendLinkGateway.deleteLinks(linksToDelete)
        : { success: false };

    await FrontendAnchorGateway.deleteAnchors(anchorsToDelete);
    if (deleteLinkResp.success) {
      setLinkMenuRefresh(!linkMenuRefresh);
      setAnchorRefresh(!anchorRefresh);
      //unset the links in the editor that were deleted
      editor?.commands.selectAll();
      editor?.commands.unsetLink();
    }

    //update content and re-add the anchor marks
    const content = editor?.getHTML();
    const nodeProperty = makeINodeProperty("content", content);

    await FrontendNodeGateway.updateNode(currentNode.nodeId, [nodeProperty]);
    addAnchorMarks();
    setLinkMenuRefresh(!linkMenuRefresh);
  };

  const onPointerUp = () => {
    if (!editor) {
      return;
    }
    const from = editor.state.selection.from;
    const to = editor.state.selection.to;
    const text = editor.state.doc.textBetween(from, to);
    if (from !== to) {
      const selectedExtent: Extent = {
        type: "text",
        startCharacter: from - 1,
        endCharacter: to - 1,
        text: text,
      };
      console.log(selectedExtent, "selectedExtent");
      setSelectedExtent(selectedExtent);
    } else {
      setSelectedExtent(null);
    }
  };

  if (!editor) {
    return <div className="text-content">{currentNode?.content}</div>;
  }

  return (
    <div
      onFocus={() => {
        setEditing(true);
        setCurrentNode(currentNode);
      }}
      onBlur={() => {
        // setEditing(false);
      }}
      className="editor-container"
    >
      {editing && <TextMenu editor={editor} save={handleContentChange} />}
      <EditorContent
        className="editorContent"
        editor={editor}
        onPointerUp={onPointerUp}
      />
    </div>
  );
};
