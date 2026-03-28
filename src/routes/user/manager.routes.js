const express = require("express");
const router = express.Router();
const {createEmployee, getTeam, getEmployee, updateEmployee, deleteEmployee} = require("../../controllers/manager.controller");
const { authenticate, validateUserEmail, authorize } = require("../../middleware/auth.middleware");

// manager actions (manager or admin)
/**
 * @swagger
 * /api/manager/create-employee:
 *   post:
 *     summary: Create a new employee/manager (Admin only)
 *     tags: [Manager]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, role]
 *             properties:
 *               name: { type: string }
 *               email: { type: string }
 *               role: { type: string }
 *               department: { type: string }
 *               contactNumber: { type: string }
 *               companyEmail: { type: string }
 *               jobDescription: { type: string }
 *     responses:
 *       201: { description: Employee created and credentials emailed }
 *       403: { description: Limit reached or unauthorized }
 */
router.post("/create-employee", authenticate, validateUserEmail, authorize("manager", "admin"), createEmployee);

/**
 * @swagger
 * /api/manager/team:
 *   get:
 *     summary: Get all users in the workspace
 *     tags: [Manager]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: List of team members }
 */
router.get("/team", authenticate, validateUserEmail, authorize("manager", "admin"), getTeam);

/**
 * @swagger
 * /api/manager/employee/{id}:
 *   get:
 *     summary: Get specific employee details
 *     tags: [Manager]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Employee details }
 *       404: { description: Not found }
 */
router.get("/employee/:id", authenticate, validateUserEmail, authorize("manager", "admin"), getEmployee);

/**
 * @swagger
 * /api/manager/employee/{id}:
 *   patch:
 *     summary: Update employee details
 *     tags: [Manager]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               role: { type: string }
 *               department: { type: string }
 *               isVerified: { type: boolean }
 *     responses:
 *       200: { description: Update successful }
 */
router.patch("/employee/:id", authenticate, validateUserEmail, authorize("manager", "admin"), updateEmployee);

/**
 * @swagger
 * /api/manager/employee/{id}:
 *   delete:
 *     summary: Deactivate/Delete employee account
 *     tags: [Manager]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Account deactivated }
 */
router.delete("/employee/:id", authenticate, validateUserEmail, authorize("manager", "admin"), deleteEmployee);

module.exports = router;
