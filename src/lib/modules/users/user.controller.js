import { UserModel } from "./user.model.js";

export const UserController = {
  async getAll(req, res, next) {
    try {
      const users = await UserModel.findAll();
      res.json({ success: true, data: users });
    } catch (error) {
      next(error);
    }
  },
};