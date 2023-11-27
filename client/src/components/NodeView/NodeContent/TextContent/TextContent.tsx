import React, { useEffect } from "react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { FrontendAnchorGateway } from "../../../../anchors";
import {
  currentNodeState,
  refreshAnchorState,
  refreshLinkListState,
  refreshState,
  selectedExtentState,
  isLinkingState,
} from "../../../../global/Atoms";
import { FrontendLinkGateway } from "../../../../links";
import {
  Extent,
  INodeProperty,
  IServiceResponse,
  ITextExtent,
  failureServiceResponse,
  makeINodeProperty,
  successfulServiceResponse,
} from "../../../../types";
import "./TextContent.scss";
import { Link } from "@tiptap/extension-link";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Highlight } from "@tiptap/extension-highlight";
import { TextMenu } from "./TextMenu";
import Underline from "@tiptap/extension-underline";
import Code from "@tiptap/extension-code";
import { FrontendNodeGateway } from "~/nodes";

/** The content of an text node, including all its anchors */
export const TextContent = () => {
  const currentNode = useRecoilValue(currentNodeState);
  const [refresh, setRefresh] = useRecoilState(refreshState);
  const [anchorRefresh, setAnchorRefresh] = useRecoilState(refreshAnchorState);
  const [linkMenuRefresh, setLinkMenuRefresh] =
    useRecoilState(refreshLinkListState);
  const setSelectedExtent = useSetRecoilState(selectedExtentState);
  const isLinking = useRecoilValue(isLinkingState);

  // TODO: Add all of the functionality for a rich text editor!
  // (This file is where the majority of your work on text editing will be done)
  const editor = useEditor({
    extensions: [
      StarterKit,
      Highlight,
      Underline,
      Code,
      Link.configure({
        openOnClick: true,
        autolink: false,
        linkOnPaste: false,
      }),
    ],
    content: currentNode.content,
  });

  /** Function to update changes in content and anchors in the editor in database */
  const updateContent = async () => {
    if (!editor) {
      return failureServiceResponse("no editor");
    }

    //get anchors from database
    const anchorsRes = await FrontendAnchorGateway.getAnchorsByNodeId(
      currentNode.nodeId
    );
    if (!anchorsRes.success) {
      console.error(anchorsRes.message);
    }
    const databaseAnchors = anchorsRes.payload;
    const databaseAnchorIds: string[] = [];
    databaseAnchors &&
      databaseAnchors.forEach((anchor) => {
        databaseAnchorIds.push(anchor.anchorId);
      });

    //update anchor extents
    const updateAnchorsRes = await updateAnchors();
    if (!updateAnchorsRes.success) {
      return failureServiceResponse(updateAnchorsRes.message);
    }
    const editorAnchorIds = updateAnchorsRes.payload;

    //delete anchors that are in database but not in editor
    const deleteAnchorsIds = databaseAnchorIds.filter((databaseAnchorId) => {
      return !editorAnchorIds.includes(databaseAnchorId);
    });
    await deleteAnchors(deleteAnchorsIds);

    //update node with content
    const updateContentRes = await setNewNodeContent();
    if (!updateContentRes.success) {
      return failureServiceResponse(updateContentRes.message);
    }

    //refresh!
    setAnchorRefresh(!anchorRefresh);
    setLinkMenuRefresh(!linkMenuRefresh);
    setRefresh(!refresh);
  };

  /** Updates the extent of any text anchors that were edited */
  const updateAnchors = async (): Promise<IServiceResponse<string[]>> => {
    if (!editor) {
      return failureServiceResponse("no editor");
    }

    const editorAnchorIds: string[] = [];

    //loop through anchors
    editor.state.doc.descendants(function (node, pos) {
      const marks = node.marks;
      const links = marks.filter((mark) => {
        return mark.type.name == "link";
      });
      links.forEach(async (mark) => {
        //get anchors
        const anchorId = mark.attrs.target;
        console.log(mark);
        editorAnchorIds.push(anchorId);
        const anchorRes = await FrontendAnchorGateway.getAnchor(anchorId);
        if (!anchorRes.success) {
          return failureServiceResponse(anchorRes.message);
        }
        const anchor = anchorRes.payload;

        if (anchor?.extent?.type !== "text") {
          return;
        }

        //check if anchor has different text
        if (
          anchor.extent.text != node.text ||
          anchor.extent.startCharacter != pos - 1
        ) {
          //update in datatbase
          const newText = node.text ?? "";
          const newExtent: ITextExtent = {
            type: "text",
            text: newText,
            startCharacter: pos - 1,
            endCharacter: pos - 1 + newText.length,
          };
          console.log(newExtent);
          const updateRes = await FrontendAnchorGateway.updateExtent(
            anchorId,
            newExtent
          );
          if (!updateRes.success) {
            return failureServiceResponse(updateRes.message);
          }
        }
      });
    });
    return successfulServiceResponse(editorAnchorIds);
  };

  /** Deletes all anchors in the database that were deleted in editor */
  const deleteAnchors = async (deleteAnchorIds: string[]) => {
    for (let i = 0; i < deleteAnchorIds.length; i++) {
      //get links associated with anchor
      const linkRes = await FrontendLinkGateway.getLinksByAnchorId(
        deleteAnchorIds[i]
      );
      if (!linkRes.success) {
        console.error(linkRes.message);
      }
      const links = linkRes.payload;

      if (!links) {
        continue;
      }
      const linksIds: string[] = [];
      for (let i = 0; i < links.length; i++) {
        linksIds.push(links[i].linkId);

        //if anchor being deleted is linked to another anchor on the same node,
        //unset link for the other anchor
        if (links[i].anchor1NodeId == links[i].anchor2NodeId) {
          let anchorId = links[i].anchor1Id;
          if (anchorId == deleteAnchorIds[i]) {
            anchorId = links[i].anchor2Id;
          }
          const anchorRes = await FrontendAnchorGateway.getAnchor(anchorId);
          if (!anchorRes.success) {
            console.error(anchorRes.message);
          }
          const anchor = anchorRes.payload;
          if (anchor?.extent?.type === "text" && editor) {
            editor.commands.setTextSelection({
              from: anchor.extent.startCharacter,
              to: anchor.extent.endCharacter + 1,
            });
            editor.commands.unsetLink();
          }
        }
      }

      //delete links
      const deleteLinkRes = await FrontendLinkGateway.deleteLinks(linksIds);
      if (!deleteLinkRes.success) {
        console.error(deleteLinkRes.message);
      }
    }
  };

  /** Sets the node content to the new editor content */
  const setNewNodeContent = async (): Promise<IServiceResponse<null>> => {
    if (!editor) {
      return failureServiceResponse("no editor");
    }
    const newContent = editor.getHTML();
    const nodePropertyContent: INodeProperty = makeINodeProperty(
      "content",
      newContent
    );
    const nodeRes = await FrontendNodeGateway.updateNode(currentNode.nodeId, [
      nodePropertyContent,
    ]);
    if (!nodeRes.success) {
      return failureServiceResponse(nodeRes.message);
    }
    return successfulServiceResponse(null);
  };

  /** This function adds anchor marks for anchors in the database to the text editor */
  const addAnchorMarks = async (): Promise<IServiceResponse<any>> => {
    if (!editor) {
      return failureServiceResponse("no editor");
    }
    const anchorResponse = await FrontendAnchorGateway.getAnchorsByNodeId(
      currentNode.nodeId
    );
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
      editor.commands.setContent(currentNode.content);
      addAnchorMarks();
    }
  }, [currentNode, editor, isLinking]);

  // Set the selected extent to null when this component loads
  useEffect(() => {
    setSelectedExtent(null);
  }, [currentNode]);

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
      setSelectedExtent(selectedExtent);
    } else {
      setSelectedExtent(null);
    }
  };

  if (!editor) {
    return <div>{currentNode.content}</div>;
  }

  return (
    <div>
      <TextMenu editor={editor} onSave={updateContent} />
      <EditorContent editor={editor} onPointerUp={onPointerUp} />
    </div>
  );
};
