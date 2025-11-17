import { DataTypes } from "sequelize";
import { sequelize } from "../../core/database/index.js";

export const NewsletterSubscriber = sequelize.define("NewsletterSubscriber", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: "newsletter_subscribers",
  timestamps: false,
});