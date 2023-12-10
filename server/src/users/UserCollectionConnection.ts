import {
  IServiceResponse,
  failureServiceResponse,
  successfulServiceResponse,
  IUser,
  isIUser,
} from "../types";
import { MongoClient } from "mongodb";

/**
 * NodeCollectionConnection acts as an in-between communicator between
 * the MongoDB database and BackendNodeGateway. NodeCollectionConnection
 * defines methods that interact directly with MongoDB. That said,
 * it does not include any of the complex logic that BackendNodeGateway has.
 *
 * For example:
 * NodeCollectionConnection.deleteNode() will only delete a single node.
 * BackendNodeGateway.deleteNode() deletes all its children from the database
 * as well.
 *
 * @param {MongoClient} client
 * @param {string} collectionName
 */
export class UserCollectionConnection {
  client: MongoClient;
  collectionName: string;

  constructor(mongoClient: MongoClient, collectionName?: string) {
    this.client = mongoClient;
    this.collectionName = collectionName ?? "users";
  }

  /**
   * Inserts a new user into the database
   * Returns successfulServiceResponse with IUser that was inserted as the payload
   *
   * @param {IUser} user
   * @return successfulServiceResponse<IUser>
   */
  async insertUser(user: IUser): Promise<IServiceResponse<IUser>> {
    if (!isIUser(user)) {
      return failureServiceResponse(
        "Failed to insert user due to improper input " +
          "to userCollectionConnection.createUser"
      );
    }
    const insertResponse = await this.client
      .db()
      .collection(this.collectionName)
      .insertOne(user);
    if (insertResponse.insertedCount) {
      return successfulServiceResponse(insertResponse.ops[0]);
    }
    return failureServiceResponse(
      "Failed to create user, insertCount: " + insertResponse.insertedCount
    );
  }

  /**
   * Finds user with the userId in the database
   *
   * @param {string} userId
   * @return successfulServiceResponse<IUser> on success
   *         failureServiceResponse on failure
   */
  async findUserById(userId: string): Promise<IServiceResponse<IUser>> {
    const findResponse = await this.client
      .db()
      .collection(this.collectionName)
      .findOne({ userId: userId });
    if (findResponse == null) {
      return failureServiceResponse("Failed to find user with this userId.");
    } else {
      return successfulServiceResponse(findResponse);
    }
  }

  /**
   * Finds users with the userId's in the database
   * Returns successfulServiceResponse with empty array when no users found.
   *
   * @param {string[]} userIds
   * @return successfulServiceResponse<IUser[]> on success
   */
  async findUsersById(userIds: string[]): Promise<IServiceResponse<IUser[]>> {
    const foundUsers: IUser[] = [];
    await this.client
      .db()
      .collection(this.collectionName)
      .find({ userId: { $in: userIds } })
      .forEach(function (doc) {
        foundUsers.push(doc);
      });
    return successfulServiceResponse(foundUsers);
  }

  /**
   * Finds user with the email in the database
   *
   * @param {string} email
   * @return successfulServiceResponse<IUser> on success
   *         failureServiceResponse on failure
   */
  async findUserByEmail(email: string): Promise<IServiceResponse<IUser>> {
    const findResponse = await this.client
      .db()
      .collection(this.collectionName)
      .findOne({ email: email });
    if (findResponse == null) {
      return failureServiceResponse("Failed to find user with this email.");
    } else {
      return successfulServiceResponse(findResponse);
    }
  }

  /**
   * Finds users with the email in the database
   *
   * @param {string} email
   * @return successfulServiceResponse<IUser> on success
   *         failureServiceResponse on failure
   */
  async findUsersByEmail(emails: string[]): Promise<IServiceResponse<IUser[]>> {
    const foundUsers: IUser[] = [];
    await this.client
      .db()
      .collection(this.collectionName)
      .find({ email: { $in: emails } })
      .forEach(function (doc) {
        foundUsers.push(doc);
      });
    return successfulServiceResponse(foundUsers);
  }

  /**
   * Deletes user with the id in the database
   *
   * @param {string} userId
   * @return successfulServiceResponse<IUser> on success
   *         failureServiceResponse on failure
   */
  async deleteUserById(userId: string): Promise<IServiceResponse<null>> {
    const deleteResponse = await this.client
      .db()
      .collection(this.collectionName)
      .deleteOne({ userId: userId });
    if (!deleteResponse.result.ok) {
      return failureServiceResponse("Failed to find user with this id.");
    }
    return successfulServiceResponse(null);
  }

  /**
   * Deletes all users in the colelction
   *
   * @return successfulServiceResponse<null> on success
   *         failureServiceResponse on failure
   */
  async clearUserCollection(): Promise<IServiceResponse<null>> {
    const response = await this.client
      .db()
      .collection(this.collectionName)
      .deleteMany({});
    if (response.result.ok) {
      return successfulServiceResponse(null);
    }
    return failureServiceResponse("Failed to clear users collection.");
  }
}
