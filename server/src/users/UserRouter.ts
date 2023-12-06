import express, { Request, Response, Router } from "express";
import { MongoClient } from "mongodb";
import { IServiceResponse, IUser, IUserSession, isIUser } from "../types";
import { BackendUserGateway } from "./BackendUserGateway";
import { json } from "body-parser";
const bodyJsonParser = json();

export const UserExpressRouter = express.Router();

/**
 * NodeRouter uses NodeExpressRouter (an express router) to define responses
 * for specific HTTP requests at routes starting with '/node'.
 * E.g. a post request to '/node/create' would create a node.
 * The NodeRouter contains a BackendNodeGateway so that when an HTTP request
 * is received, the NodeRouter can call specific methods on BackendNodeGateway
 * to trigger the appropriate response. See server/src/app.ts to see how
 * we set up NodeRouter - you don't need to know the details of this just yet.
 */
export class UserRouter {
  BackendUserGateway: BackendUserGateway;

  constructor(mongoClient: MongoClient) {
    this.BackendUserGateway = new BackendUserGateway(mongoClient);

    /**
     * Request to create user
     *
     * @param req request object coming from client
     * @param res response object to send to client
     */
    UserExpressRouter.post("/create", async (req: Request, res: Response) => {
      try {
        const user = req.body.user;
        if (!isIUser(user)) {
          res.status(400).send("not IUser!");
        } else {
          const response = await this.BackendUserGateway.createUser(user);
          res.status(200).send(response);
        }
      } catch (e) {
        res.status(500).send(e.message);
      }
    });

    /**
     * Request to find user by email
     *
     * @param req request object coming from client
     * @param res response object to send to client
     */
    UserExpressRouter.post(
      "/getByEmail",
      async (req: Request, res: Response) => {
        try {
          const userEmail = req.body.email;
          const response: IServiceResponse<IUser> =
            await this.BackendUserGateway.getUserByEmail(userEmail);
          res.status(200).send(response);
        } catch (e) {
          res.status(500).send(e.message);
        }
      }
    );

    /**
     * Request to authenticate user
     *
     * @param req request object coming from client
     * @param res response object to send to client
     */
    UserExpressRouter.post(
      "/authenticate",
      async (req: Request, res: Response) => {
        try {
          const userEmail = req.body.email;
          const userPassword = req.body.password;
          const response: IServiceResponse<IUserSession> =
            await this.BackendUserGateway.authenticateUser(
              userEmail,
              userPassword
            );
          res.status(200).send(response);
        } catch (e) {
          res.status(500).send(e.message);
        }
      }
    );
  }

  /**
   * @returns NodeRouter class
   */
  getExpressRouter = (): Router => {
    return UserExpressRouter;
  };
}
