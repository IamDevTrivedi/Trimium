import { Router } from "express";
import { controllers } from "./controllers";
import { protectRoute } from "@/middlewares/protectRoute";

const router = Router();

router.post("/create-workspace", protectRoute, controllers.createWorkspace);
router.post("/accept-or-decline-invitation", protectRoute, controllers.acceptORDeclineInvitation);
router.post("/get-all-invitations", protectRoute, controllers.getAllInvitations);

router.post("/sudo-update-workspace", protectRoute, controllers.sudoUpdateWorkspace);

router.post("/my-workspaces", protectRoute, controllers.getMyWorkspaces);
router.post("/leave-workspace", protectRoute, controllers.leaveWorkspace);
router.post("/get-workspace-details", protectRoute, controllers.getWorkspaceDetails);
router.post("/workspace-permission", protectRoute, controllers.workspacePermission);

router.post("/create-tag", protectRoute, controllers.createTag);
router.post("/update-tag", protectRoute, controllers.updateTag);
router.post("/delete-tag", protectRoute, controllers.deleteTag);

router.post("/set-tags-to-shortcode", protectRoute, controllers.setTagsToShortcode);

router.post("/get-tags", protectRoute, controllers.getTags);

export default router;
