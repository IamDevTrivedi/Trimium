import { Router } from "express";
import { controllers } from "./controllers";
import { protectRoute } from "@/middlewares/protectRoute";
import { createRateLimiter } from "@/middlewares/rateLimiter";

const router = Router();

const workspaceCreateLimiter = createRateLimiter({
    windowMs: 5 * 60 * 1000,
    max: 10,
    message: "Too many workspace creation requests. Please try again later.",
    prefix: "rl:workspace:create",
});

const workspaceMutationLimiter = createRateLimiter({
    windowMs: 60 * 1000,
    max: 30,
    message: "Too many workspace update requests. Please slow down.",
    prefix: "rl:workspace:mutation",
});

const workspaceReadLimiter = createRateLimiter({
    windowMs: 60 * 1000,
    max: 60,
    message: "Too many requests. Please slow down.",
    prefix: "rl:workspace:read",
});

const invitationLimiter = createRateLimiter({
    windowMs: 60 * 1000,
    max: 20,
    message: "Too many invitation requests. Please slow down.",
    prefix: "rl:workspace:invitation",
});

const tagLimiter = createRateLimiter({
    windowMs: 60 * 1000,
    max: 40,
    message: "Too many tag requests. Please slow down.",
    prefix: "rl:workspace:tag",
});

router.post("/create-workspace", protectRoute, workspaceCreateLimiter, controllers.createWorkspace);
router.post(
    "/accept-or-decline-invitation",
    protectRoute,
    invitationLimiter,
    controllers.acceptORDeclineInvitation
);
router.post("/get-all-invitations", protectRoute, invitationLimiter, controllers.getAllInvitations);

router.post(
    "/sudo-update-workspace",
    protectRoute,
    workspaceMutationLimiter,
    controllers.sudoUpdateWorkspace
);

router.post("/my-workspaces", protectRoute, workspaceReadLimiter, controllers.getMyWorkspaces);
router.post("/leave-workspace", protectRoute, workspaceMutationLimiter, controllers.leaveWorkspace);
router.post(
    "/get-workspace-details",
    protectRoute,
    workspaceReadLimiter,
    controllers.getWorkspaceDetails
);
router.post(
    "/workspace-permission",
    protectRoute,
    workspaceReadLimiter,
    controllers.workspacePermission
);

router.post("/create-tag", protectRoute, tagLimiter, controllers.createTag);
router.post("/update-tag", protectRoute, tagLimiter, controllers.updateTag);
router.post("/delete-tag", protectRoute, tagLimiter, controllers.deleteTag);

router.post("/set-tags-to-shortcode", protectRoute, tagLimiter, controllers.setTagsToShortcode);

router.post("/get-tags", protectRoute, tagLimiter, controllers.getTags);

export default router;
