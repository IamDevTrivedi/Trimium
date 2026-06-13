import { Router } from "express";
import { controllers } from "./controllers";
import { protectRoute } from "@/middlewares/protectRoute";
import { createRateLimiter } from "@/middlewares/rateLimiter";

const router = Router();

const workspaceCreateLimiter = createRateLimiter({
    windowMs: 5 * 60 * 1000,
    max: 10,
    prefix: "rl:workspace:create",
});

const workspaceMutationLimiter = createRateLimiter({
    windowMs: 60 * 1000,
    max: 30,
    prefix: "rl:workspace:mutation",
});

const workspaceReadLimiter = createRateLimiter({
    windowMs: 60 * 1000,
    max: 60,
    prefix: "rl:workspace:read",
});

const invitationLimiter = createRateLimiter({
    windowMs: 60 * 1000,
    max: 20,
    prefix: "rl:workspace:invitation",
});

const tagLimiter = createRateLimiter({
    windowMs: 60 * 1000,
    max: 40,
    prefix: "rl:workspace:tag",
});

/**
 * @openapi
 * /api/v1/workspace:
 *   post:
 *     tags: [Workspace]
 *     summary: Create workspace
 *     description: Create a new workspace. Optionally invite members during creation.
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title]
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               members:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     email:
 *                       type: string
 *                       format: email
 *                     permission:
 *                       type: string
 *                       enum: [admin, editor, viewer]
 *     responses:
 *       200:
 *         description: Workspace created
 *       401:
 *         description: Unauthorized
 */
router.post("/", protectRoute, workspaceCreateLimiter, controllers.createWorkspace);

/**
 * @openapi
 * /api/v1/workspace:
 *   get:
 *     tags: [Workspace]
 *     summary: List my workspaces
 *     description: Get all workspaces the authenticated user is a member of.
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of workspaces
 *       401:
 *         description: Unauthorized
 */
router.get("/", protectRoute, workspaceReadLimiter, controllers.getMyWorkspaces);

/**
 * @openapi
 * /api/v1/workspace/{workspaceID}:
 *   get:
 *     tags: [Workspace]
 *     summary: Get workspace details
 *     description: Get detailed information about a specific workspace including members, tags, and settings.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: workspaceID
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Workspace details
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Workspace not found
 */
router.get("/:workspaceID", protectRoute, workspaceReadLimiter, controllers.getWorkspaceDetails);

/**
 * @openapi
 * /api/v1/workspace/{workspaceID}:
 *   patch:
 *     tags: [Workspace]
 *     summary: Update workspace
 *     description: Update workspace settings and manage member permissions. Requires admin permission.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: workspaceID
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               membersToUpdate:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [memberID, permission]
 *                   properties:
 *                     memberID:
 *                       type: string
 *                     permission:
 *                       type: string
 *                       enum: [admin, editor, viewer]
 *     responses:
 *       200:
 *         description: Workspace updated
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */
router.patch(
    "/:workspaceID",
    protectRoute,
    workspaceMutationLimiter,
    controllers.sudoUpdateWorkspace
);

/**
 * @openapi
 * /api/v1/workspace/{workspaceID}/leave:
 *   post:
 *     tags: [Workspace]
 *     summary: Leave workspace
 *     description: Leave a workspace. You will lose access to all shortcodes within it.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: workspaceID
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Left workspace successfully
 *       401:
 *         description: Unauthorized
 */
router.post(
    "/:workspaceID/leave",
    protectRoute,
    workspaceMutationLimiter,
    controllers.leaveWorkspace
);

/**
 * @openapi
 * /api/v1/workspace/{workspaceID}:
 *   delete:
 *     tags: [Workspace]
 *     summary: Delete workspace
 *     description: Delete a workspace. Requires admin permission. This action is irreversible.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: workspaceID
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Workspace deleted
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */
router.delete("/:workspaceID", protectRoute, workspaceMutationLimiter, controllers.deleteWorkspace);

/**
 * @openapi
 * /api/v1/workspace/{workspaceID}/permission:
 *   get:
 *     tags: [Workspace]
 *     summary: Get workspace permission
 *     description: Get the authenticated user's permission level within a workspace.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: workspaceID
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Permission level
 *       401:
 *         description: Unauthorized
 */
router.get(
    "/:workspaceID/permission",
    protectRoute,
    workspaceReadLimiter,
    controllers.workspacePermission
);

/**
 * @openapi
 * /api/v1/workspace/{workspaceID}/tags:
 *   get:
 *     tags: [Workspace]
 *     summary: Get workspace tags
 *     description: Get all tags within a workspace. Optionally filter by shortcode.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: workspaceID
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: shortCode
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tags retrieved
 *       401:
 *         description: Unauthorized
 */
router.get("/:workspaceID/tags", protectRoute, tagLimiter, controllers.getTags);

/**
 * @openapi
 * /api/v1/workspace/{workspaceID}/tags:
 *   post:
 *     tags: [Workspace]
 *     summary: Create tag
 *     description: Create a new tag in a workspace. Tags categorize shortcodes.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: workspaceID
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [tag, tagID]
 *             properties:
 *               tag:
 *                 type: string
 *                 description: Tag name (alphanumeric, hyphens allowed)
 *               tagID:
 *                 type: integer
 *                 description: Numeric ID for ordering
 *     responses:
 *       200:
 *         description: Tag created
 *       401:
 *         description: Unauthorized
 */
router.post("/:workspaceID/tags", protectRoute, tagLimiter, controllers.createTag);

/**
 * @openapi
 * /api/v1/workspace/{workspaceID}/tags:
 *   patch:
 *     tags: [Workspace]
 *     summary: Update tag
 *     description: Update an existing tag. You can rename the tag and/or change its numeric ID.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: workspaceID
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [oldTag]
 *             properties:
 *               oldTag:
 *                 type: string
 *               newTag:
 *                 type: string
 *               newTagID:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Tag updated
 *       401:
 *         description: Unauthorized
 */
router.patch("/:workspaceID/tags", protectRoute, tagLimiter, controllers.updateTag);

/**
 * @openapi
 * /api/v1/workspace/{workspaceID}/tags/{tag}:
 *   delete:
 *     tags: [Workspace]
 *     summary: Delete tag
 *     description: Delete a tag from a workspace. The tag is also removed from all shortcodes using it.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: workspaceID
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: tag
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tag deleted
 *       401:
 *         description: Unauthorized
 */
router.delete("/:workspaceID/tags/:tag", protectRoute, tagLimiter, controllers.deleteTag);

/**
 * @openapi
 * /api/v1/workspace/invitations:
 *   get:
 *     tags: [Workspace]
 *     summary: List invitations
 *     description: Get all pending workspace invitations for the authenticated user.
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Invitations retrieved
 *       401:
 *         description: Unauthorized
 */
router.get("/invitations", protectRoute, invitationLimiter, controllers.getAllInvitations);

/**
 * @openapi
 * /api/v1/workspace/invitations/{invitationID}:
 *   patch:
 *     tags: [Workspace]
 *     summary: Respond to invitation
 *     description: Accept or decline a workspace invitation.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: invitationID
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [accept]
 *             properties:
 *               accept:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Invitation responded
 *       401:
 *         description: Unauthorized
 */
router.patch(
    "/invitations/:invitationID",
    protectRoute,
    invitationLimiter,
    controllers.acceptORDeclineInvitation
);

export default router;
