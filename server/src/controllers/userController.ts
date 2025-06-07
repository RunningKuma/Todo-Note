// filepath: /sqlite-auth-server/sqlite-auth-server/src/controllers/userController.ts

import { Request, Response } from 'express';
import UserService from '../services/userService';

class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  public async getUser(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.id;
      const user = await this.userService.getUserById(userId);
      if (user) {
        res.status(200).json(user);
      } else {
        res.status(404).json({ message: 'User not found' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  }

  public async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.id;
      const updatedUser = await this.userService.updateUser(userId, req.body);
      res.status(200).json(updatedUser);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  }

  public async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.id;
      await this.userService.deleteUser(userId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  }
}

export default UserController;