import { Analytics } from "@/models/analytics";
import { URL } from "@/models/url";
import mongoose from "mongoose";

// TODO: Cache the results for better performance ? for example cache for 3 minutes
export const getWorkspacePerformance = async (workspaceID: string) => {
    // ? Get total URLs
    const totalURLS = await Analytics.countDocuments({ workspaceID: workspaceID });

    // ? Get total active URLs
    const totalActiveURLs = await URL.countDocuments({ workspaceID: workspaceID, isActive: true });

    // ? Get total redirections and lands
    const totalClickData = await Analytics.aggregate([
        { $match: { workspaceID: new mongoose.Types.ObjectId(workspaceID) } },
        {
            $group: {
                _id: null,
                totalRedirections: { $sum: "$totalClicks" },
                totalLands: { $sum: "$lands" },
            },
        },
    ]);

    // ? Get device stats
    const totalDeviceStats = await Analytics.aggregate([
        { $match: { workspaceID: new mongoose.Types.ObjectId(workspaceID) } },
        {
            $group: {
                _id: null,
                desktop: { $sum: "$deviceStats.desktop" },
                mobile: { $sum: "$deviceStats.mobile" },
                tablet: { $sum: "$deviceStats.tablet" },
                others: { $sum: "$deviceStats.others" },
            },
        },
        {
            $project: {
                _id: 0,
                total: { $add: ["$desktop", "$mobile", "$tablet", "$others"] },
                desktop: 1,
                mobile: 1,
                tablet: 1,
                others: 1,
            },
        },
        {
            $project: {
                desktop: {
                    $cond: [
                        { $eq: ["$total", 0] },
                        0,
                        { $multiply: [{ $divide: ["$desktop", "$total"] }, 100] },
                    ],
                },
                mobile: {
                    $cond: [
                        { $eq: ["$total", 0] },
                        0,
                        { $multiply: [{ $divide: ["$mobile", "$total"] }, 100] },
                    ],
                },
                tablet: {
                    $cond: [
                        { $eq: ["$total", 0] },
                        0,
                        { $multiply: [{ $divide: ["$tablet", "$total"] }, 100] },
                    ],
                },
                others: {
                    $cond: [
                        { $eq: ["$total", 0] },
                        0,
                        { $multiply: [{ $divide: ["$others", "$total"] }, 100] },
                    ],
                },
            },
        },
    ]);

    // ? Get Browser stats
    const totalBrowserStats = await Analytics.aggregate([
        { $match: { workspaceID: new mongoose.Types.ObjectId(workspaceID) } },
        {
            $group: {
                _id: null,
                chrome: { $sum: "$browserStats.chrome" },
                firefox: { $sum: "$browserStats.firefox" },
                safari: { $sum: "$browserStats.safari" },
                edge: { $sum: "$browserStats.edge" },
                opera: { $sum: "$browserStats.opera" },
                others: { $sum: "$browserStats.others" },
            },
        },
        {
            $project: {
                _id: 0,
                total: { $add: ["$chrome", "$firefox", "$safari", "$edge", "$opera", "$others"] },
                chrome: 1,
                firefox: 1,
                safari: 1,
                edge: 1,
                opera: 1,
                others: 1,
            },
        },
        {
            $project: {
                chrome: {
                    $cond: [
                        { $eq: ["$total", 0] },
                        0,
                        { $multiply: [{ $divide: ["$chrome", "$total"] }, 100] },
                    ],
                },
                firefox: {
                    $cond: [
                        { $eq: ["$total", 0] },
                        0,
                        { $multiply: [{ $divide: ["$firefox", "$total"] }, 100] },
                    ],
                },
                safari: {
                    $cond: [
                        { $eq: ["$total", 0] },
                        0,
                        { $multiply: [{ $divide: ["$safari", "$total"] }, 100] },
                    ],
                },
                edge: {
                    $cond: [
                        { $eq: ["$total", 0] },
                        0,
                        { $multiply: [{ $divide: ["$edge", "$total"] }, 100] },
                    ],
                },
                opera: {
                    $cond: [
                        { $eq: ["$total", 0] },
                        0,
                        { $multiply: [{ $divide: ["$opera", "$total"] }, 100] },
                    ],
                },
                others: {
                    $cond: [
                        { $eq: ["$total", 0] },
                        0,
                        { $multiply: [{ $divide: ["$others", "$total"] }, 100] },
                    ],
                },
            },
        },
    ]);

    // ? unique locations with at least one click
    const totalUniqueLocations = await Analytics.aggregate([
        { $match: { workspaceID: new mongoose.Types.ObjectId(workspaceID) } },
        {
            $project: {
                locations: { $objectToArray: "$locationStats" },
            },
        },
        { $unwind: "$locations" },
        {
            $match: {
                "locations.v": { $gte: 1 },
            },
        },
        {
            $group: {
                _id: "$locations.k",
            },
        },
        {
            $count: "totalUniqueLocations",
        },
    ]);

    // ? Top 5 performing locations
    const topLinkByLocations = await Analytics.aggregate([
        { $match: { workspaceID: new mongoose.Types.ObjectId(workspaceID) } },
        {
            $project: {
                locations: { $objectToArray: "$locationStats" },
            },
        },
        { $unwind: "$locations" },
        {
            $group: {
                _id: "$locations.k",
                count: { $sum: "$locations.v" },
            },
        },
        {
            $sort: { count: -1 },
        },
        {
            $limit: 5,
        },
        {
            $group: {
                _id: null,
                locations: { $push: { location: "$_id", count: "$count" } },
                total: { $sum: "$count" },
            },
        },
        { $unwind: "$locations" },
        {
            $project: {
                _id: 0,
                location: "$locations.location",
                count: "$locations.count",
                percentage: {
                    $cond: [
                        { $eq: ["$total", 0] },
                        0,
                        { $multiply: [{ $divide: ["$locations.count", "$total"] }, 100] },
                    ],
                },
            },
        },
    ]);

    // ? Click-Through Rate (CTR): (total lands / total clicks) * 100
    const CTR = await Analytics.aggregate([
        { $match: { workspaceID: new mongoose.Types.ObjectId(workspaceID) } },
        {
            $group: {
                _id: null,
                totalClicks: { $sum: "$totalClicks" },
                totalLands: { $sum: "$lands" },
            },
        },
        {
            $project: {
                _id: 0,
                totalClicks: 1,
                totalLands: 1,
                ctr: {
                    $cond: [
                        { $eq: ["$totalClicks", 0] },
                        0,
                        { $multiply: [{ $divide: ["$totalLands", "$totalClicks"] }, 100] },
                    ],
                },
            },
        },
    ]);

    // ? Average Clicks per Link
    const averageClicksPerLink = await Analytics.aggregate([
        { $match: { workspaceID: new mongoose.Types.ObjectId(workspaceID) } },
        {
            $group: {
                _id: null,
                totalClicks: { $sum: "$totalClicks" },
                totalLinks: { $sum: 1 },
            },
        },
        {
            $project: {
                _id: 0,
                averageClicksPerLink: {
                    $cond: [
                        { $eq: ["$totalLinks", 0] },
                        0,
                        { $divide: ["$totalClicks", "$totalLinks"] },
                    ],
                },
            },
        },
    ]);

    // ? Most Active Day
    const mostActiveDay = await Analytics.aggregate([
        { $match: { workspaceID: new mongoose.Types.ObjectId(workspaceID) } },
        {
            $project: {
                weeklyStats: 1,
            },
        },
        {
            $unwind: { path: "$weeklyStats", includeArrayIndex: "dayIndex" },
        },
        {
            $group: {
                _id: "$dayIndex",
                totalClicks: { $sum: "$weeklyStats" },
            },
        },
        {
            $sort: { totalClicks: -1 },
        },
        {
            $limit: 1,
        },
        {
            $project: {
                _id: 0,
                day: {
                    $arrayElemAt: [
                        [
                            "Sunday",
                            "Monday",
                            "Tuesday",
                            "Wednesday",
                            "Thursday",
                            "Friday",
                            "Saturday",
                        ],
                        "$_id",
                    ],
                },
                totalClicks: 1,
            },
        },
    ]);

    // ? Most Active Hour
    const mostActiveHour = await Analytics.aggregate([
        { $match: { workspaceID: new mongoose.Types.ObjectId(workspaceID) } },
        {
            $project: {
                hourlyStats: 1,
            },
        },
        {
            $unwind: { path: "$hourlyStats", includeArrayIndex: "hourIndex" },
        },
        {
            $group: {
                _id: "$hourIndex",
                totalClicks: { $sum: "$hourlyStats" },
            },
        },
        {
            $sort: { totalClicks: -1 },
        },
        {
            $limit: 1,
        },
        {
            $project: {
                _id: 0,
                hour: "$_id",
                totalClicks: 1,
            },
        },
    ]);

    // ? Table: All the links with basic info (shortCode , title , totalClicks , uniqueVisitors , lands)
    const allURLs = await Analytics.aggregate([
        {
            $match: {
                workspaceID: new mongoose.Types.ObjectId(workspaceID),
            },
        },
        {
            $project: {
                shortCode: 1,
                totalClicks: 1,
                lands: 1,
                uniqueVisitors: { $size: "$uniqueVisitors" },
            },
        },
    ]);

    const allURLsWithTitle = await Promise.all(
        allURLs.map(async (url) => {
            const result = await URL.findOne(
                { shortCode: url.shortCode },
                {
                    title: 1,
                    isActive: 1,
                    tags: 1,
                    _id: 0,
                }
            ).lean();
            return {
                ...result,
                ...url,
            };
        })
    );

    return {
        totalURLS,
        totalActiveURLs,

        totalRedirections: totalClickData[0] ? totalClickData[0].totalRedirections : 0,
        totalLands: totalClickData[0] ? totalClickData[0].totalLands : 0,

        deviceStats: totalDeviceStats[0]
            ? {
                  desktop: totalDeviceStats[0].desktop,
                  mobile: totalDeviceStats[0].mobile,
                  tablet: totalDeviceStats[0].tablet,
                  others: totalDeviceStats[0].others,
              }
            : {
                  desktop: 0,
                  mobile: 0,
                  tablet: 0,
                  others: 0,
              },

        browserStats: totalBrowserStats[0]
            ? {
                  chrome: totalBrowserStats[0].chrome,
                  firefox: totalBrowserStats[0].firefox,
                  safari: totalBrowserStats[0].safari,
                  edge: totalBrowserStats[0].edge,
                  opera: totalBrowserStats[0].opera,
                  others: totalBrowserStats[0].others,
              }
            : {
                  chrome: 0,
                  firefox: 0,
                  safari: 0,
                  edge: 0,
                  opera: 0,
                  others: 0,
              },

        totalUniqueLocations: totalUniqueLocations[0]
            ? totalUniqueLocations[0].totalUniqueLocations
            : 0,

        topLinkByLocations: topLinkByLocations,

        CTR: CTR[0] ? CTR[0].ctr : 0,

        averageClicksPerLink: averageClicksPerLink[0]
            ? averageClicksPerLink[0].averageClicksPerLink
            : 0,

        mostActiveDay: mostActiveDay[0] ? mostActiveDay[0] : { day: 0, totalClicks: 0 },
        mostActiveHour: mostActiveHour[0] ? mostActiveHour[0] : { hour: 0, totalClicks: 0 },

        allURLsWithTitle: allURLsWithTitle,
    };
};
