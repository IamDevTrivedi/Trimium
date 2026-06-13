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

router.post("/", protectRoute, workspaceCreateLimiter, controllers.createWorkspace);
router.get("/", protectRoute, workspaceReadLimiter, controllers.getMyWorkspaces);
router.get("/:workspaceID", protectRoute, workspaceReadLimiter, controllers.getWorkspaceDetails);
router.patch("/:workspaceID", protectRoute, workspaceMutationLimiter, controllers.sudoUpdateWorkspace);
router.post("/:workspaceID/leave", protectRoute, workspaceMutationLimiter, controllers.leaveWorkspace);
router.delete("/:workspaceID", protectRoute, workspaceMutationLimiter, controllers.deleteWorkspace);
router.get("/:workspaceID/permission", protectRoute, workspaceReadLimiter, controllers.workspacePermission);

router.get("/:workspaceID/tags", protectRoute, tagLimiter, controllers.getTags);
router.post("/:workspaceID/tags", protectRoute, tagLimiter, controllers.createTag);
router.patch("/:workspaceID/tags", protectRoute, tagLimiter, controllers.updateTag);
router.delete("/:workspaceID/tags/:tag", protectRoute, tagLimiter, controllers.deleteTag);

router.get("/invitations", protectRoute, invitationLimiter, controllers.getAllInvitations);
router.patch("/invitations/:invitationID", protectRoute, invitationLimiter, controllers.acceptORDeclineInvitation);

export default router;
