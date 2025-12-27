import { Router } from "express";
import { controllers } from "./controllers";
import { protectRoute } from "@/middlewares/protectRoute";

const router = Router();

// Workspace Invitation Management: Accessible to All Members
router.post("/create-workspace", protectRoute, controllers.createWorkspace);
router.post("/accept-or-decline-invitation", protectRoute, controllers.acceptORDeclineInvitation);
router.post("/get-all-invitations", protectRoute, controllers.getAllInvitations);

// Workspace Member Management: Admin Only
router.post("/sudo-update-workspace", protectRoute, controllers.sudoUpdateWorkspace);

// General Workspace Operations: Accessible to All Members
router.post("/my-workspaces", protectRoute, controllers.getMyWorkspaces);
router.post("/leave-workspace", protectRoute, controllers.leaveWorkspace);
router.post("/get-workspace-details", protectRoute, controllers.getWorkspaceDetails);

export default router;
