import { useNavigation } from "@react-navigation/native";
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ImageBackground,
  StatusBar,
  Pressable,
  Image,
  Modal,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import {
  Star,
  Heart,
  X,
  Package,
  Tag,
  Calendar,
  QrCode,
  Trash2,
  AlertCircle,
} from "lucide-react-native";
import SearchIcon from "../../../assets/SearchIcon.svg";
import Filter_NewIcon from "../../../assets/Filter_NewIcon.svg";
import PieGraph from "../../../assets/PieGraph.svg";
import Graph from "../../../assets/Graph.svg";
import useStore from "../../store";

const PLACEHOLDER = require("../../../assets/dummy_product.png");

// ─────────────────────────────────────────────
// SCAN DETAIL MODAL
// ─────────────────────────────────────────────
const ScanDetailModal = ({ visible, scan, onClose, onDelete }) => {
  if (!scan) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return "Unknown date";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      year: "numeric", month: "long", day: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={modalStyles.overlay}>
        <View style={modalStyles.container}>
          <View style={modalStyles.header}>
            <Text style={modalStyles.title}>Scan Details</Text>
            <TouchableOpacity onPress={onClose} style={modalStyles.closeBtn}>
              <X size={20} color="#333" />
            </TouchableOpacity>
          </View>
          {scan.image ? (
            <Image source={{ uri: scan.image }} style={modalStyles.productImage} resizeMode="cover" />
          ) : (
            <View style={modalStyles.imagePlaceholder}>
              <Package size={48} color="#ccc" />
            </View>
          )}
          <View style={modalStyles.detailsContainer}>
            <View style={modalStyles.detailRow}>
              <Package size={16} color="#130160" />
              <View style={modalStyles.detailText}>
                <Text style={modalStyles.detailLabel}>Product Name</Text>
                <Text style={modalStyles.detailValue}>{scan.product_name || "Unknown Product"}</Text>
              </View>
            </View>
            <View style={modalStyles.detailRow}>
              <Tag size={16} color="#130160" />
              <View style={modalStyles.detailText}>
                <Text style={modalStyles.detailLabel}>Category</Text>
                <Text style={modalStyles.detailValue}>{scan.category || "Uncategorized"}</Text>
              </View>
            </View>
            <View style={modalStyles.detailRow}>
              <QrCode size={16} color="#130160" />
              <View style={modalStyles.detailText}>
                <Text style={modalStyles.detailLabel}>QR Data</Text>
                <Text style={modalStyles.detailValue} numberOfLines={2}>{scan.qr_data}</Text>
              </View>
            </View>
            <View style={modalStyles.detailRow}>
              <Calendar size={16} color="#130160" />
              <View style={modalStyles.detailText}>
                <Text style={modalStyles.detailLabel}>Scanned At</Text>
                <Text style={modalStyles.detailValue}>{formatDate(scan.scanned_at)}</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity style={modalStyles.deleteBtn} onPress={() => onDelete(scan.scan_id)}>
            <Trash2 size={16} color="#fff" />
            <Text style={modalStyles.deleteBtnText}>Delete Scan</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// ─────────────────────────────────────────────
// SCAN HISTORY SCREEN
// ─────────────────────────────────────────────
const ScanHistoryScreen = () => {
  const navigation = useNavigation();
  const accessToken = useStore((state) => state.accessToken);
  const fetchScans = useStore((state) => state.fetchScans);
  const deleteScan = useStore((state) => state.deleteScan);

  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [totalScans, setTotalScans] = useState(0);
  const [scansRemaining, setScansRemaining] = useState(100);
  const [selectedScan, setSelectedScan] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [authError, setAuthError] = useState(false);

  const loadScans = useCallback(async (isRefresh = false) => {
    if (!accessToken) {
      setLoading(false);
      setAuthError(true);
      return;
    }
    setAuthError(false);
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      const result = await fetchScans();
      if (result?.success) {
        setScans(result.data || []);
        setTotalScans(result.data?.length || 0);
        setScansRemaining(100 - (result.data?.length || 0));
      }
    } catch (error) {
      if (error?.response?.status === 401) setAuthError(true);
      else Alert.alert("Error", "Failed to load scans. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [accessToken, fetchScans]);

  useEffect(() => { loadScans(); }, [loadScans]);

  const handleDeleteScan = async (scanId) => {
    try {
      const result = await deleteScan(scanId);
      if (result?.success) {
        setScans((prev) => prev.filter((s) => s.scan_id !== scanId));
        setTotalScans((prev) => prev - 1);
        setScansRemaining((prev) => prev + 1);
        setModalVisible(false);
        Alert.alert("Deleted", "Scan removed from your library.");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to delete scan.");
    }
  };

  const confirmDelete = (scanId) => {
    Alert.alert("Delete Scan", "Are you sure you want to remove this scan?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => handleDeleteScan(scanId) },
    ]);
  };

  const recentScans = [...scans].sort((a, b) => new Date(b.scanned_at) - new Date(a.scanned_at));
  const oldestScans = [...scans].sort((a, b) => new Date(a.scanned_at) - new Date(b.scanned_at));

  const renderScanCard = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => { setSelectedScan(item); setModalVisible(true); }} activeOpacity={0.85}>
      {item.image ? (
        <Image source={{ uri: item.image }} style={styles.image} resizeMode="cover" />
      ) : (
        <View style={scanStyles.imageFallback}>
          <QrCode size={22} color="#2CCCA6" />
        </View>
      )}
      <Text style={styles.name} numberOfLines={2}>{item.product_name || "Unknown Product"}</Text>
      <Text style={styles.subtitle} numberOfLines={1}>{item.category || "Uncategorized"}</Text>
      <Text style={scanStyles.dateText}>
        {item.scanned_at ? new Date(item.scanned_at).toLocaleDateString() : "—"}
      </Text>
      <TouchableOpacity style={styles.heartButton} onPress={() => confirmDelete(item.scan_id)}>
        <Trash2 size={13} color="red" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (authError) {
    return (
      <View style={scanStyles.emptyContainer}>
        <AlertCircle size={48} color="#E53935" />
        <Text style={[scanStyles.emptyTitle, { color: "#E53935" }]}>Session Expired</Text>
        <Text style={scanStyles.emptySubtitle}>Please log out and log back in to view your scans.</Text>
        <TouchableOpacity style={[styles.gettingStarted, { marginTop: hp(2), width: "70%" }]} onPress={() => loadScans()}>
          <Text style={{ color: "#fff", fontFamily: "Nunito-SemiBold", fontSize: hp(1.9) }}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ width: "100%" }}>
      <View style={{ ...styles.searchParent, marginBottom: "4%" }}>
        <Pressable style={styles.searchContainer}>
          <View style={styles.cameraButton}><SearchIcon /></View>
          <Text style={styles.input}>search for anything</Text>
        </Pressable>
        <TouchableOpacity style={styles.menuButton}><Filter_NewIcon /></TouchableOpacity>
      </View>

      <View style={scanStyles.counterRow}>
        <View style={scanStyles.counterBadge}>
          <QrCode size={14} color="#fff" />
          <Text style={scanStyles.counterText}>{totalScans} / 100 Scans Used</Text>
        </View>
        <Text style={scanStyles.remainingText}>{scansRemaining} remaining</Text>
      </View>

      <View style={scanStyles.progressContainer}>
        <View style={scanStyles.progressTrack}>
          <View style={[scanStyles.progressFill, { width: `${Math.min((totalScans / 100) * 100, 100)}%` }]} />
        </View>
      </View>

      <View style={styles.graphCard}>
        <Text style={{ fontSize: wp(3.7), color: "#130160", fontFamily: "Nunito-Bold" }}>VIEWS</Text>
        <Graph width={"98%"} height={"90%"} />
      </View>

      <TouchableOpacity style={styles.gettingStarted} onPress={() => navigation.navigate("UploadScreen")}>
        <Text style={{ fontFamily: "Nunito-SemiBold", color: "#fff", fontSize: hp(2) }}>Upload New Content</Text>
      </TouchableOpacity>

      <View style={{ height: hp(38), flexDirection: "row" }}>
        <View style={{ width: "72%", justifyContent: "space-around", alignItems: "center" }}>
          <View style={{ width: "80%" }}>
            <Text style={{ color: "#130160", fontFamily: "Nunito-SemiBold", fontSize: hp(2), textDecorationLine: "underline" }}>
              UPLOADS CATEGORY
            </Text>
          </View>
          <PieGraph />
          <View style={{ flexDirection: "row", justifyContent: "space-between", width: "90%" }}>
            {[{ color: "#0049AF", label: "Category 1" }, { color: "#FFBB36", label: "Category 2" }, { color: "#70B6C1", label: "Category 3" }].map((c, i) => (
              <View key={i} style={{ flexDirection: "row", alignItems: "center" }}>
                <View style={{ width: wp(4), height: hp(1.2), backgroundColor: c.color, borderRadius: 3 }} />
                <Text style={{ color: "#000", fontSize: hp(1.4) }}> {c.label}</Text>
              </View>
            ))}
          </View>
        </View>
        <View style={{ width: "28%", height: "60%", alignSelf: "center", justifyContent: "space-between" }}>
          {[{ color: "#0049AF", label: "Category 1" }, { color: "#70B6C1", label: "Category 2" }, { color: "#6F19C2", label: "Category 3" }].map((c, i) => (
            <View key={i} style={{ height: "18%", width: "100%", paddingRight: "4%" }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <View style={{ width: 13, height: 13, backgroundColor: c.color, borderRadius: 20 }} />
                <Text style={{ color: "gray", fontSize: hp(1.9) }}>{c.label}</Text>
              </View>
              <View style={{ width: "68%", alignSelf: "flex-end", paddingVertical: "1%" }}>
                <Text style={{ color: "#000", fontWeight: "600", fontSize: hp(2.2) }}>45%</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={scanStyles.sectionHeader}>
        <Text style={scanStyles.sectionTitle}>RECENT SCANS</Text>
        <Text style={scanStyles.sectionCount}>{recentScans.length} items</Text>
      </View>

      {loading ? (
        <View style={scanStyles.loadingContainer}>
          <ActivityIndicator size="large" color="#2CCCA6" />
          <Text style={scanStyles.loadingText}>Loading your scans...</Text>
        </View>
      ) : recentScans.length === 0 ? (
        <View style={scanStyles.emptyContainer}>
          <QrCode size={48} color="#ccc" />
          <Text style={scanStyles.emptyTitle}>No Scans Yet</Text>
          <Text style={scanStyles.emptySubtitle}>Scan a product QR code to see it here</Text>
        </View>
      ) : (
        <FlatList
          data={recentScans}
          renderItem={renderScanCard}
          keyExtractor={(item) => item.scan_id || item.qr_data}
          numColumns={3}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadScans(true)} colors={["#2CCCA6"]} />}
        />
      )}

      {!loading && oldestScans.length > 0 && (
        <>
          <View style={scanStyles.sectionHeader}>
            <Text style={scanStyles.sectionTitle}>OLDEST SCANS</Text>
            <Text style={scanStyles.sectionCount}>{oldestScans.length} items</Text>
          </View>
          <View style={{ marginBottom: "10%" }}>
            <FlatList
              data={oldestScans}
              renderItem={renderScanCard}
              keyExtractor={(item) => `oldest-${item.scan_id || item.qr_data}`}
              numColumns={3}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
            />
          </View>
        </>
      )}

      <ScanDetailModal
        visible={modalVisible}
        scan={selectedScan}
        onClose={() => setModalVisible(false)}
        onDelete={confirmDelete}
      />
    </View>
  );
};

// ─────────────────────────────────────────────
// MY ITEMS SCREEN — fetches from backend
// ─────────────────────────────────────────────
const MyItemsScreen = () => {
  const navigation = useNavigation();
  const fetchTrendingProducts = useStore((state) => state.fetchTrendingProducts);
  const accessToken = useStore((state) => state.accessToken);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadItems = useCallback(async (isRefresh = false) => {
    if (!accessToken) { setLoading(false); return; }
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      const data = await fetchTrendingProducts();
      setItems(data || []);
    } catch (err) {
      console.error("MyItems fetch error:", err.message);
      Alert.alert("Error", "Failed to load items.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [accessToken, fetchTrendingProducts]);

  useEffect(() => { loadItems(); }, [loadItems]);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate("SinglePageItem", { productId: item.id, section: "Items", data: items })}
    >
      <Image source={item.image || PLACEHOLDER} style={styles.image} resizeMode="cover" />
      <Text style={styles.name} numberOfLines={2}>{item.title || item.description || "Product"}</Text>
      <Text style={styles.subtitle} numberOfLines={1}>{item.category || "—"}</Text>
      <View style={styles.ratingContainer}>
        <Star size={12} color="#FFD700" fill="#FFD700" />
        <Text style={styles.rating}>{item.rating || "—"}</Text>
      </View>
      <TouchableOpacity style={styles.heartButton}>
        <Heart size={13} color="red" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={{ width: "100%" }}>
      <View style={{ ...styles.searchParent, marginBottom: "4%" }}>
        <Pressable style={styles.searchContainer}>
          <View style={styles.cameraButton}><SearchIcon /></View>
          <Text style={styles.input}>search for anything</Text>
        </Pressable>
        <TouchableOpacity style={styles.menuButton}><Filter_NewIcon /></TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.gettingStarted} onPress={() => navigation.navigate("AddProduct")}>
        <Text style={{ fontFamily: "Nunito-SemiBold", color: "#fff", fontSize: hp(2) }}>Add New Item</Text>
      </TouchableOpacity>

      {loading ? (
        <View style={scanStyles.loadingContainer}>
          <ActivityIndicator size="large" color="#130160" />
          <Text style={scanStyles.loadingText}>Loading items...</Text>
        </View>
      ) : items.length === 0 ? (
        <View style={scanStyles.emptyContainer}>
          <Package size={48} color="#ccc" />
          <Text style={scanStyles.emptyTitle}>No Items Yet</Text>
          <Text style={scanStyles.emptySubtitle}>Add your first product to see it here</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={(item, i) => item.id?.toString() || `item-${i}`}
          numColumns={3}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadItems(true)} colors={["#130160"]} />}
        />
      )}
    </View>
  );
};

// ─────────────────────────────────────────────
// PROMOTIONS SCREEN — fetches from backend
// ─────────────────────────────────────────────
const AllTotalScans = () => {
  const navigation = useNavigation();
  const fetchPromotions = useStore((state) => state.fetchPromotions);
  const accessToken = useStore((state) => state.accessToken);

  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [active, setActive] = useState(true);

  const loadPromotions = useCallback(async (isRefresh = false) => {
    if (!accessToken) { setLoading(false); return; }
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      const data = await fetchPromotions();
      setPromotions(data || []);
    } catch (err) {
      console.error("Promotions fetch error:", err.message);
      Alert.alert("Error", "Failed to load promotions.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [accessToken, fetchPromotions]);

  useEffect(() => { loadPromotions(); }, [loadPromotions]);

  // ✅ Filter by status field from backend
  const now = new Date();
  const activePromos = promotions.filter((p) => {
    if (p.status === "Active" || p.status === "active") return true;
    if (p.end_date) return new Date(p.end_date) >= now;
    return true;
  });
  const expiredPromos = promotions.filter((p) => {
    if (p.status === "Inactive" || p.status === "inactive") return true;
    if (p.end_date) return new Date(p.end_date) < now;
    return false;
  });

  const displayedPromos = active ? activePromos : expiredPromos;

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate("PromotionScreen", { promotionId: item.id, data: promotions })}
    >
      <Image source={item.image || PLACEHOLDER} style={styles.image} resizeMode="cover" />
      <Text style={styles.name} numberOfLines={2}>{item.title || "Promotion"}</Text>
      <Text style={styles.subtitle} numberOfLines={1}>{item.shortDescription || item.description || "—"}</Text>
      <View style={styles.ratingContainer}>
        <Text style={{ fontSize: hp(1.2), color: active ? "#14BA9C" : "#E53935", fontFamily: "Nunito-SemiBold" }}>
          {active ? "Active" : "Expired"}
        </Text>
      </View>
      {item.dateRange && (
        <Text style={{ fontSize: hp(1.1), color: "#999", fontFamily: "Nunito-Regular", marginTop: 2 }} numberOfLines={1}>
          {item.dateRange}
        </Text>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={{ width: "100%" }}>
      {/* Toggle */}
      <View style={{ width: "95%", alignSelf: "center", marginVertical: "5%" }}>
        <View style={{ flexDirection: "row", width: "100%", height: 50, backgroundColor: "#DDF4F3", borderRadius: 5 }}>
          <TouchableOpacity
            style={{ flex: 1, justifyContent: "center", alignItems: "center", borderRadius: 5, margin: 5, backgroundColor: active ? "#FFFFFF" : "transparent", elevation: active ? 3 : 0 }}
            onPress={() => setActive(true)}
          >
            <Text style={{ fontFamily: "Nunito-Regular", fontSize: 14, color: "#000", fontWeight: active ? "600" : "normal", opacity: active ? 1 : 0.6 }}>
              Active Promotions
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ flex: 1, justifyContent: "center", alignItems: "center", borderRadius: 5, margin: 5, backgroundColor: !active ? "#FFFFFF" : "transparent", elevation: !active ? 3 : 0 }}
            onPress={() => setActive(false)}
          >
            <Text style={{ fontFamily: "Nunito-Regular", fontSize: 14, color: !active ? "red" : "#000", fontWeight: !active ? "600" : "normal", opacity: !active ? 1 : 0.6 }}>
              Expired Promotions
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={scanStyles.loadingContainer}>
          <ActivityIndicator size="large" color="#130160" />
          <Text style={scanStyles.loadingText}>Loading promotions...</Text>
        </View>
      ) : displayedPromos.length === 0 ? (
        <View style={scanStyles.emptyContainer}>
          <Tag size={48} color="#ccc" />
          <Text style={scanStyles.emptyTitle}>{active ? "No Active Promotions" : "No Expired Promotions"}</Text>
          <Text style={scanStyles.emptySubtitle}>
            {active ? "Create a promotion to get started" : "Your expired promotions will appear here"}
          </Text>
        </View>
      ) : (
        <FlatList
          data={displayedPromos}
          renderItem={renderItem}
          keyExtractor={(item, i) => item.id?.toString() || `promo-${i}`}
          numColumns={3}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadPromotions(true)} colors={["#130160"]} />}
          style={{ marginBottom: "5%" }}
        />
      )}

      <TouchableOpacity style={styles.gettingStarted} onPress={() => navigation.navigate("NewPromotionScreen")}>
        <Text style={{ fontFamily: "Nunito-SemiBold", color: "#fff", fontSize: hp(2) }}>Create New Promotion</Text>
      </TouchableOpacity>
    </View>
  );
};

// ─────────────────────────────────────────────
// MAIN MY LIBRARY SCREEN
// ─────────────────────────────────────────────
const MyLibrary = () => {
  const [activeTab, setActiveTab] = useState("scan");
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" />
      <ImageBackground
        source={require("../../../assets/vector_1.png")}
        style={styles.vector}
        resizeMode="stretch"
      >
        <View style={styles.header}>
          <View style={styles.headerChild}>
            <Pressable onPress={() => navigation.goBack()}>
              <MaterialIcons name="arrow-back-ios" color="#0D0D26" size={25} />
            </Pressable>
            <Text style={styles.headerText}>My Library</Text>
          </View>
        </View>

        <View style={styles.tabContainer}>
          {[
            { key: "scan", label: "Feed" },
            { key: "items", label: "Items" },
            { key: "all_scans", label: "Promotion" },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, activeTab === tab.key && styles.activeTab]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text style={[styles.tabText, activeTab === tab.key && styles.activeTabText]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {activeTab === "scan" && <ScanHistoryScreen />}
          {activeTab === "items" && <MyItemsScreen />}
          {activeTab === "all_scans" && <AllTotalScans />}
        </ScrollView>
      </ImageBackground>
    </View>
  );
};

// ─────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────
const scanStyles = StyleSheet.create({
  counterRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginHorizontal: "3%", marginBottom: "2%" },
  counterBadge: { flexDirection: "row", alignItems: "center", backgroundColor: "#130160", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  counterText: { color: "#fff", fontFamily: "Nunito-SemiBold", fontSize: hp(1.6), marginLeft: 4 },
  remainingText: { color: "#2CCCA6", fontFamily: "Nunito-SemiBold", fontSize: hp(1.6) },
  progressContainer: { marginHorizontal: "3%", marginBottom: "3%" },
  progressTrack: { height: 6, backgroundColor: "#E0E0E0", borderRadius: 10, overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: "#2CCCA6", borderRadius: 10 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginVertical: "5%", paddingHorizontal: "2%" },
  sectionTitle: { color: "#000000", fontFamily: "Nunito-Bold", fontSize: hp(2.4) },
  sectionCount: { color: "#524B6B", fontFamily: "Nunito-Regular", fontSize: hp(1.7) },
  imageFallback: { width: "100%", height: hp(8), backgroundColor: "#F0F9F8", justifyContent: "center", alignItems: "center", borderRadius: 6, marginBottom: 8 },
  dateText: { fontSize: hp(1.1), color: "#999", fontFamily: "Nunito-Regular", marginTop: 2 },
  loadingContainer: { alignItems: "center", justifyContent: "center", paddingVertical: hp(5) },
  loadingText: { color: "#666", fontFamily: "Nunito-Regular", fontSize: hp(1.8), marginTop: 8 },
  emptyContainer: { alignItems: "center", justifyContent: "center", paddingVertical: hp(6) },
  emptyTitle: { color: "#333", fontFamily: "Nunito-Bold", fontSize: hp(2.2), marginTop: 10 },
  emptySubtitle: { color: "#999", fontFamily: "Nunito-Regular", fontSize: hp(1.7), textAlign: "center", paddingHorizontal: "10%", marginTop: 4 },
});

const modalStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  container: { backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: "5%", paddingBottom: hp(4), paddingTop: "4%" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: "4%" },
  title: { fontFamily: "Nunito-Bold", fontSize: hp(2.4), color: "#130160" },
  closeBtn: { padding: 6, backgroundColor: "#F5F5F5", borderRadius: 20 },
  productImage: { width: "100%", height: hp(20), borderRadius: 12, marginBottom: "4%", backgroundColor: "#F0F0F0" },
  imagePlaceholder: { width: "100%", height: hp(15), borderRadius: 12, backgroundColor: "#F5F5F5", justifyContent: "center", alignItems: "center", marginBottom: "4%" },
  detailsContainer: { marginBottom: "5%" },
  detailRow: { flexDirection: "row", alignItems: "flex-start", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#F0F0F0" },
  detailText: { flex: 1, marginLeft: 12 },
  detailLabel: { fontFamily: "Nunito-Regular", fontSize: hp(1.5), color: "#999", marginBottom: 2 },
  detailValue: { fontFamily: "Nunito-SemiBold", fontSize: hp(1.9), color: "#1E1E1E" },
  deleteBtn: { backgroundColor: "#E53935", flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: hp(1.8), borderRadius: 12 },
  deleteBtnText: { color: "#fff", fontFamily: "Nunito-SemiBold", fontSize: hp(2), marginLeft: 8 },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#E6F3F5" },
  header: { width: wp(100), height: hp(7), marginTop: "10%", paddingHorizontal: "5%", flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  headerChild: { flexDirection: "row", alignItems: "center" },
  headerText: { fontFamily: "Nunito-Bold", fontSize: hp(3), color: "#0D0140" },
  tabContainer: { flexDirection: "row", justifyContent: "space-around", width: "100%", paddingHorizontal: "5%", height: hp(6), marginTop: "3%" },
  tab: { borderRadius: 9, borderWidth: 0.5, borderColor: "gray", marginHorizontal: "1%", width: "30%", justifyContent: "center", alignItems: "center" },
  activeTab: { backgroundColor: "#2CCCA6", borderColor: "#2CCCA6" },
  tabText: { fontSize: hp(1.9), fontFamily: "Nunito-SemiBold", color: "#000" },
  activeTabText: { color: "#fff" },
  content: { flex: 1, paddingHorizontal: "2%", paddingVertical: "2%" },
  vector: { flex: 1, width: wp(100), height: hp(50) },
  card: { width: "20%", flex: 1, backgroundColor: "#fff", borderRadius: 8, padding: "2%", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3, marginHorizontal: "0.85%", marginBottom: "5%" },
  graphCard: { flex: 1, width: "95%", height: hp(18), backgroundColor: "#F2F5F8", borderRadius: 6, marginHorizontal: 5, elevation: 2, paddingVertical: "2.5%", alignItems: "center", alignSelf: "center" },
  image: { width: "100%", height: hp(8), borderRadius: 6, marginBottom: 8 },
  name: { fontSize: hp(1.36), marginBottom: 4, color: "#000", fontFamily: "DMSans-SemiBold" },
  subtitle: { fontSize: hp(1.5), color: "#14BA9C", fontFamily: "DMSans-SemiBold", marginBottom: "4%" },
  ratingContainer: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  rating: { fontSize: hp(1.3), fontWeight: "bold", color: "#000" },
  reviews: { marginLeft: 4, fontSize: hp(1.2), color: "#666" },
  heartButton: { position: "absolute", bottom: "2%", right: "1%", borderRadius: 15, padding: 5 },
  searchParent: { flexDirection: "row", alignItems: "center", marginHorizontal: "3%" },
  searchContainer: { flex: 1, flexDirection: "row", alignItems: "center", borderWidth: 1, borderRadius: 12, marginRight: 10, borderColor: "#99ABC678", height: hp(6.5), backgroundColor: "#F2F2F2" },
  cameraButton: { padding: 10 },
  input: { flex: 1, fontSize: hp(2.2), fontFamily: "Nunito-Regular", paddingVertical: 8, color: "#999" },
  menuButton: { backgroundColor: "#130160", padding: 10, borderRadius: 12, height: hp(6.5), width: wp(14), justifyContent: "center", alignItems: "center" },
  gettingStarted: { backgroundColor: "#130160", width: "90%", height: hp(6), borderRadius: 10, justifyContent: "center", alignItems: "center", alignSelf: "center", marginTop: "3%", marginBottom: "3%" },
});

export default MyLibrary;