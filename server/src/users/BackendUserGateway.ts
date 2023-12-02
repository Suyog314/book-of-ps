import { MongoClient } from "mongodb";
import {
  failureServiceResponse,
  IServiceResponse,
  successfulServiceResponse,
  IUser,
  isIUser,
} from "../types";
import { UserCollectionConnection } from "./UserCollectionConnection";

/**
 * BackendNodeGateway handles requests from NodeRouter, and calls on methods
 * in NodeCollectionConnection to interact with the database. It contains
 * the complex logic to check whether the request is valid, before
 * modifying the database.
 *
 * Example:
 * Before insertion, BackendNodeGateway.createNode() will check whether the database
 * already contains a node with the same nodeId, as well as the the validity of
 * node's file path. In comparison, the NodeCollectionConnection.insertNode()
 * method simply retrieves the node object, and inserts it into the database.
 */
export class BackendUserGateway {
  userCollectionConnection: UserCollectionConnection;

  constructor(mongoClient: MongoClient, collectionName?: string) {
    this.userCollectionConnection = new UserCollectionConnection(
      mongoClient,
      collectionName ?? "users"
    );
  }

  /**
   * Method to create a user and insert it into the database.
   *
   * @param userId - The userId of the user to be created.
   */
  async createUser(user: any): Promise<IServiceResponse<IUser>> {
    // check whether is valid Node
    const isValidUser = isIUser(user);
    if (!isValidUser) {
      return failureServiceResponse("Not a valid user.");
    }
    // check whether already in database
    const userResponse = await this.userCollectionConnection.findUserById(
      user.userId
    );
    if (userResponse.success) {
      return failureServiceResponse("User already exist in database.");
    }
    const emailResponse = await this.userCollectionConnection.findUserByEmail(
      user.email
    );
    if (emailResponse.success) {
      return failureServiceResponse("Email already used.");
    }
    // if everything checks out, insert node
    const insertUserResp = await this.userCollectionConnection.insertUser(user);
    return insertUserResp;
  }

  /**
   * Method to find a user
   *
   * @param userId - The userId of the user to get.
   */
  async getUserById(userId: string): Promise<IServiceResponse<IUser>> {
    return this.userCollectionConnection.findUserById(userId);
  }

  /**
   * Method to find a list of users
   *
   * @param userId[] - The userId's of the user to get.
   */
  async getUsersById(userIds: string[]): Promise<IServiceResponse<IUser[]>> {
    return this.userCollectionConnection.findUsersById(userIds);
  }

  /**
   * Method to delete all users from the collection
   *
   */
  async deleteAll(): Promise<IServiceResponse<null>> {
    return await this.userCollectionConnection.clearUserCollection();
  }
}
