import express, { Request, Response, Router } from "express";
import { MongoClient } from "mongodb";
import {
  INode,
  INodeProperty,
  RecursiveNodeTree,
  IServiceResponse,
  isINode,
  Cuisine,
} from "../types";
import { BackendNodeGateway } from "./BackendNodeGateway";
import { json } from "body-parser";
const bodyJsonParser = json();

export const NodeExpressRouter = express.Router();

/**
 * NodeRouter uses NodeExpressRouter (an express router) to define responses
 * for specific HTTP requests at routes starting with '/node'.
 * E.g. a post request to '/node/create' would create a node.
 * The NodeRouter contains a BackendNodeGateway so that when an HTTP request
 * is received, the NodeRouter can call specific methods on BackendNodeGateway
 * to trigger the appropriate response. See server/src/app.ts to see how
 * we set up NodeRouter - you don't need to know the details of this just yet.
 */
export class NodeRouter {
  BackendNodeGateway: BackendNodeGateway;

  constructor(mongoClient: MongoClient) {
    this.BackendNodeGateway = new BackendNodeGateway(mongoClient);

    /**
     * Request to create node
     *
     * @param req request object coming from client
     * @param res response object to send to client
     */
    NodeExpressRouter.post("/create", async (req: Request, res: Response) => {
      try {
        const node = req.body.node;
        if (!isINode(node)) {
          res.status(400).send("not INode!");
        } else {
          const response = await this.BackendNodeGateway.createNode(node);
          res.status(200).send(response);
        }
      } catch (e) {
        res.status(500).send(e.message);
      }
    });

    /**
     * Request to retrieve node by search queries
     *
     * @param req request object coming from client
     * @param res response object to send to client
     */
    NodeExpressRouter.post("/search", async (req: Request, res: Response) => {
      try {
        const query = req.body.query;
        const sortType = req.body.sortType;
        const response: IServiceResponse<INode[]> =
          await this.BackendNodeGateway.searchNodes(query, sortType);
        res.status(200).send(response);
      } catch (e) {
        res.status(500).send(e.message);
      }
    });
    /**
     * Request to retrieve node by nodeId
     *
     * @param req request object coming from client
     * @param res response object to send to client
     */
    NodeExpressRouter.get(
      "/get/:nodeId",
      async (req: Request, res: Response) => {
        try {
          const nodeId = req.params.nodeId;
          const response: IServiceResponse<INode> =
            await this.BackendNodeGateway.getNodeById(nodeId);
          res.status(200).send(response);
        } catch (e) {
          res.status(500).send(e.message);
        }
      }
    );

    /**
     * Request to retrieve nodes by nodeIds
     *
     * @param req request object coming from client
     * @param res response object to send to client
     */
    NodeExpressRouter.post(
      "/getNodesById",
      async (req: Request, res: Response) => {
        try {
          const nodeIds = req.body.nodeIds;
          const response: IServiceResponse<INode[]> =
            await this.BackendNodeGateway.getNodesById(nodeIds);
          res.status(200).send(response);
        } catch (e) {
          res.status(500).send(e.message);
        }
      }
    );

    /**
     * Request to update the node with the given nodeId
     *
     * @param req request object coming from client
     * @param res response object to send to client
     */
    NodeExpressRouter.put(
      "/:nodeId",
      bodyJsonParser,
      async (req: Request, res: Response) => {
        try {
          const nodeId = req.params.nodeId;
          const toUpdate: INodeProperty[] = req.body.data;
          const response = await this.BackendNodeGateway.updateNode(
            nodeId,
            toUpdate
          );
          res.status(200).send(response);
        } catch (e) {
          res.status(500).send(e.message);
        }
      }
    );

    /**
     * Request to move the node with the given nodeId to the given parentId
     *
     * @param req request object coming from client
     * @param res response object to send to client
     */
    NodeExpressRouter.put(
      "/move/:nodeId/:newParentId",
      bodyJsonParser,
      async (req: Request, res: Response) => {
        try {
          const nodeId = req.params.nodeId;
          const newParentId = req.params.newParentId;
          const response = await this.BackendNodeGateway.moveNode(
            nodeId,
            newParentId
          );
          res.status(200).send(response);
        } catch (e) {
          res.status(500).send(e.message);
        }
      }
    );

    /**
     * Request to delete the node with the given nodeId
     *
     * @param req request object coming from client
     * @param res response object to send to client
     */
    NodeExpressRouter.delete(
      "/:nodeId",
      async (req: Request, res: Response) => {
        try {
          const nodeId = req.params.nodeId;
          const response = await this.BackendNodeGateway.deleteNode(nodeId);
          res.status(200).send(response);
        } catch (e) {
          res.status(500).send(e.message);
        }
      }
    );

    /**
     * Request to retrieve node with all its children
     *
     * @param req request object coming from client
     * @param res response object to send to client
     */
    NodeExpressRouter.get(
      "/root/:nodeId",
      async (req: Request, res: Response) => {
        try {
          const nodeId = req.params.nodeId;
          const response: IServiceResponse<RecursiveNodeTree> =
            await this.BackendNodeGateway.getTreeByVertex(nodeId);
          res.status(200).send(response);
        } catch (e) {
          res.status(500).send(e.message);
        }
      }
    );

    /**
     * Request to retrieve all nodes that does not have parent
     *
     * @param req request object coming from client
     * @param res response object to send to client
     */
    NodeExpressRouter.post("/roots", async (req: Request, res: Response) => {
      try {
        const userId = req.body.userId;
        const userEmail = req.body.userEmail;
        const response: IServiceResponse<RecursiveNodeTree[]> =
          await this.BackendNodeGateway.getRoots(userId, userEmail);
        res.status(200).send(response);
      } catch (e) {
        res.status(500).send(e.message);
      }
    });

    /**
     * Request to retrieve all the cuisines from current recipes
     */
    NodeExpressRouter.get("/cuisines", async (req: Request, res: Response) => {
      try {
        const response: IServiceResponse<Cuisine[]> =
          await this.BackendNodeGateway.getCuisines();
        res.status(200).send(response);
      } catch (e) {
        res.status(500).send(e.message);
      }
    });

    NodeExpressRouter.get("/time", async (req: Request, res: Response) => {
      try {
        const response: IServiceResponse<number> =
          await this.BackendNodeGateway.getMaxTime();
        res.status(200).send(response);
      } catch (e) {
        res.status(500).send(e.message);
      }
    });

    NodeExpressRouter.get("/serving", async (req: Request, res: Response) => {
      try {
        const response: IServiceResponse<number> =
          await this.BackendNodeGateway.getMaxServing();
        res.status(200).send(response);
      } catch (e) {
        res.status(500).send(e.message);
      }
    });
  }

  /**
   * @returns NodeRouter class
   */
  getExpressRouter = (): Router => {
    return NodeExpressRouter;
  };
}
