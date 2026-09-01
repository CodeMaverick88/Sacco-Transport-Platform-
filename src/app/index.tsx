import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
} from "react-native";
import { INITIAL_PARCELS } from "../constants/mockParcels";
import { Parcel, ParcelCategory, ParcelStatus } from "@/type/parcel";
import { StatusBadge } from "../components/parcels/StatusBadge";
import { Timeline } from "../components/parcels/Timeline";

export default function UnifiedParcelSystem() {
  const [activeTab, setActiveTab] = useState<
    "TRACK" | "REGISTER" | "CONDUCTOR"
  >("TRACK");
  const [parcels, setParcels] =
    useState<Record<string, Parcel>>(INITIAL_PARCELS);

  // --- Track State ---
  const [searchWaybill, setSearchWaybill] = useState("");
  const [activeParcel, setActiveParcel] = useState<Parcel | null>(
    INITIAL_PARCELS["PX-2026-001"],
  );
  const [searchError, setSearchError] = useState("");

  // --- Register State ---
  const [senderName, setSenderName] = useState("");
  const [senderPhone, setSenderPhone] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [originStage, setOriginStage] = useState("Nairobi CBD");
  const [destinationStage, setDestinationStage] = useState("Nakuru");
  const [category, setCategory] = useState<ParcelCategory>("SMALL_BOX");
  const [description, setDescription] = useState("");
  const [shippingFee, setShippingFee] = useState("400");

  // --- Conductor State ---
  const [selectedVehicle, setSelectedVehicle] = useState("KDA 123A");

  const handleSearchTrack = () => {
    const key = searchWaybill.trim().toUpperCase();
    if (parcels[key]) {
      setActiveParcel(parcels[key]);
      setSearchError("");
    } else {
      setActiveParcel(null);
      setSearchError("Waybill not found. Try PX-2026-001 or PX-2026-002.");
    }
  };

  const handleRegisterParcel = () => {
    if (!senderName || !recipientName || !description) {
      Alert.alert("Error", "Please fill in all mandatory fields.");
      return;
    }

    const newNumber = `PX-2026-00${Object.keys(parcels).length + 1}`;
    const nowId = `${Date.now()}`;
    const newParcel: Parcel = {
      id: `p${nowId}`,
      waybillNumber: newNumber,
      qrCodeData: newNumber,
      senderName,
      senderPhone,
      recipientName,
      recipientPhone,
      originStage,
      destinationStage,
      category,
      description,
      declaredValueKsh: 5000,
      shippingFeeKsh: Number(shippingFee) || 300,
      status: "REGISTERED",
      createdAt: new Date().toLocaleString(),
      events: [
        {
          id: `e-${nowId}`,
          parcelId: `p${nowId}`,
          status: "REGISTERED",
          locationName: `${originStage} Stage`,
          timestamp: "Just Now",
          actorName: "Clerk Dashboard",
          actorRole: "CLERK",
        },
      ],
    };

    setParcels((prev) => ({ ...prev, [newNumber]: newParcel }));
    setActiveParcel(newParcel);
    setActiveTab("TRACK");
    setSearchWaybill(newNumber);
    Alert.alert("Success", `Parcel Registered! Waybill: ${newNumber}`);
    // reset form
    setSenderName("");
    setSenderPhone("");
    setRecipientName("");
    setRecipientPhone("");
    setDescription("");
  };

  const handleUpdateParcelStatus = (
    waybill: string,
    newStatus: ParcelStatus,
  ) => {
    setParcels((prev) => {
      const target = prev[waybill];
      if (!target) return prev;

      const eventId = `e-${Date.now()}`;
      const updatedParcel: Parcel = {
        ...target,
        status: newStatus,
        assignedVehicleReg: selectedVehicle,
        events: [
          ...target.events,
          {
            id: eventId,
            parcelId: target.id,
            status: newStatus,
            locationName: `${target.destinationStage} Stage`,
            timestamp: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            actorName: `Conductor (${selectedVehicle})`,
            actorRole: "CONDUCTOR",
            vehicleReg: selectedVehicle,
          },
        ],
      };

      if (activeParcel?.waybillNumber === waybill) {
        setActiveParcel(updatedParcel);
      }

      return { ...prev, [waybill]: updatedParcel };
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Platform Navigation Header */}
      <View style={styles.navBar}>
        <Text style={styles.navBrand}>MEISON SACCO LOGISTICS</Text>
        <View style={styles.tabGroup}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "TRACK" && styles.activeTab,
            ]}
            onPress={() => setActiveTab("TRACK")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "TRACK" && styles.activeTabText,
              ]}
            >
              Customer Track
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "REGISTER" && styles.activeTab,
            ]}
            onPress={() => setActiveTab("REGISTER")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "REGISTER" && styles.activeTabText,
              ]}
            >
              Stage Clerk
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "CONDUCTOR" && styles.activeTab,
            ]}
            onPress={() => setActiveTab("CONDUCTOR")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "CONDUCTOR" && styles.activeTabText,
              ]}
            >
              Conductor
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.bodyContent}>
        {/* --- VIEW 1: CUSTOMER TRACKING --- */}
        {activeTab === "TRACK" && (
          <View>
            <Text style={styles.viewTitle}>Parcel Tracking System</Text>

            <View style={styles.searchRow}>
              <TextInput
                style={styles.textInput}
                placeholder="Enter Waybill Number (e.g. PX-2026-001)"
                value={searchWaybill}
                onChangeText={setSearchWaybill}
                autoCapitalize="characters"
                placeholderTextColor="#9CA3AF"
              />
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleSearchTrack}
              >
                <Text style={styles.primaryButtonText}>Track</Text>
              </TouchableOpacity>
            </View>

            {searchError ? (
              <Text style={styles.errorText}>{searchError}</Text>
            ) : null}

            {activeParcel && (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <View>
                    <Text style={styles.metaLabel}>Waybill Number</Text>
                    <Text style={styles.boldWaybill}>
                      {activeParcel.waybillNumber}
                    </Text>
                  </View>
                  <StatusBadge status={activeParcel.status} />
                </View>

                <View style={styles.divider} />

                <View style={styles.infoGrid}>
                  <View style={styles.infoCol}>
                    <Text style={styles.metaLabel}>Sender</Text>
                    <Text style={styles.valueText}>
                      {activeParcel.senderName}
                    </Text>
                  </View>

                  <View style={styles.infoCol}>
                    <Text style={styles.metaLabel}>Recipient</Text>
                    <Text style={styles.valueText}>
                      {activeParcel.recipientName}
                    </Text>
                  </View>

                  <View style={styles.infoCol}>
                    <Text style={styles.metaLabel}>Route</Text>
                    <Text style={styles.valueText}>
                      {activeParcel.originStage} →{" "}
                      {activeParcel.destinationStage}
                    </Text>
                  </View>

                  <View style={styles.infoCol}>
                    <Text style={styles.metaLabel}>Assigned Matatu</Text>
                    <Text style={styles.valueText}>
                      {activeParcel.assignedVehicleReg || "Not assigned yet"}
                    </Text>
                  </View>
                </View>

                <Text style={[styles.metaLabel, { marginTop: 14 }]}>
                  Chain of Custody Log
                </Text>
                <Timeline events={activeParcel.events} />
              </View>
            )}
          </View>
        )}

        {/* --- VIEW 2: STAGE CLERK REGISTRATION --- */}
        {activeTab === "REGISTER" && (
          <View style={styles.card}>
            <Text style={styles.viewTitle}>Register New Parcel</Text>

            <Text style={styles.sectionLabel}>Sender Information</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Sender Full Name"
              value={senderName}
              onChangeText={setSenderName}
            />
            <TextInput
              style={styles.textInput}
              placeholder="Sender Phone (07XX...)"
              value={senderPhone}
              onChangeText={setSenderPhone}
            />

            <Text style={styles.sectionLabel}>Recipient Information</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Recipient Full Name"
              value={recipientName}
              onChangeText={setRecipientName}
            />
            <TextInput
              style={styles.textInput}
              placeholder="Recipient Phone (07XX...)"
              value={recipientPhone}
              onChangeText={setRecipientPhone}
            />

            <Text style={styles.sectionLabel}>Parcel Details</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Origin Stage"
              value={originStage}
              onChangeText={setOriginStage}
            />
            <TextInput
              style={styles.textInput}
              placeholder="Destination Stage"
              value={destinationStage}
              onChangeText={setDestinationStage}
            />
            <TextInput
              style={styles.textInput}
              placeholder="Description (e.g. Bag of clothing)"
              value={description}
              onChangeText={setDescription}
            />
            <TextInput
              style={styles.textInput}
              placeholder="Shipping Fee (KSh)"
              keyboardType="numeric"
              value={shippingFee}
              onChangeText={setShippingFee}
            />

            <TouchableOpacity
              style={[styles.primaryButton, { marginTop: 15 }]}
              onPress={handleRegisterParcel}
            >
              <Text style={styles.primaryButtonText}>
                Register Parcel & Issue Waybill
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* --- VIEW 3: CONDUCTOR MANIFEST --- */}
        {activeTab === "CONDUCTOR" && (
          <View>
            <Text style={styles.viewTitle}>Conductor Manifest & Loading</Text>
            <Text style={styles.metaLabel}>
              Active Matatu Unit: {selectedVehicle}
            </Text>

            {Object.values(parcels).map((p) => (
              <View key={p.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View>
                    <Text style={styles.boldWaybill}>{p.waybillNumber}</Text>
                    <Text style={styles.valueText}>
                      {p.description} ({p.originStage} → {p.destinationStage})
                    </Text>
                  </View>
                  <StatusBadge status={p.status} />
                </View>

                <View style={styles.actionRow}>
                  {p.status === "REGISTERED" && (
                    <TouchableOpacity
                      style={styles.actionBtn}
                      onPress={() =>
                        handleUpdateParcelStatus(p.waybillNumber, "LOADED")
                      }
                    >
                      <Text style={styles.actionBtnText}>
                        Scan & Load onto Vehicle
                      </Text>
                    </TouchableOpacity>
                  )}

                  {p.status === "LOADED" && (
                    <TouchableOpacity
                      style={styles.actionBtn}
                      onPress={() =>
                        handleUpdateParcelStatus(p.waybillNumber, "IN_TRANSIT")
                      }
                    >
                      <Text style={styles.actionBtnText}>Start Transit</Text>
                    </TouchableOpacity>
                  )}

                  {p.status === "IN_TRANSIT" && (
                    <TouchableOpacity
                      style={styles.actionBtn}
                      onPress={() =>
                        handleUpdateParcelStatus(
                          p.waybillNumber,
                          "READY_FOR_PICKUP",
                        )
                      }
                    >
                      <Text style={styles.actionBtnText}>Unload at Stage</Text>
                    </TouchableOpacity>
                  )}

                  {p.status === "READY_FOR_PICKUP" && (
                    <TouchableOpacity
                      style={[styles.actionBtn, { backgroundColor: "#059669" }]}
                      onPress={() =>
                        handleUpdateParcelStatus(p.waybillNumber, "COLLECTED")
                      }
                    >
                      <Text style={styles.actionBtnText}>
                        Verify Recipient & Handover
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const colors = {
  navy: "#0F172A",
  navySoft: "#1E293B",
  yellow: "#FBBF24",
  white: "#FFFFFF",
  card: "#FFFFFF",
  muted: "#94A3B8",
  border: "#E2E8F0",
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  navBar: { backgroundColor: colors.navySoft, padding: 16, paddingTop: 22 },
  navBrand: {
    color: colors.white,
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 10,
  },
  tabGroup: { flexDirection: "row", justifyContent: "center" },
  tabButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginHorizontal: 4,
    backgroundColor: "#16232F",
  },
  activeTab: { backgroundColor: colors.yellow },
  tabText: { color: "#94A3B8", fontSize: 13, fontWeight: "600" },
  activeTabText: { color: colors.navySoft },
  bodyContent: {
    padding: 18,
    maxWidth: 900,
    width: "100%",
    alignSelf: "center",
    paddingBottom: 40,
  },
  viewTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.navy,
    marginBottom: 12,
  },
  searchRow: { flexDirection: "row", marginBottom: 12 },
  textInput: {
    flex: 1,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 46,
    marginBottom: 8,
    color: "#0F172A",
  },
  primaryButton: {
    backgroundColor: colors.yellow,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
    borderRadius: 10,
    height: 46,
    marginLeft: 10,
    minWidth: 96,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  primaryButtonText: { color: colors.navySoft, fontWeight: "800" },
  errorText: { color: "#DC2626", marginBottom: 10 },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border,
    // shadow
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  boldWaybill: { fontSize: 16, fontWeight: "800", color: colors.navy },
  metaLabel: { fontSize: 11, color: colors.muted, textTransform: "uppercase" },
  valueText: { fontSize: 13, color: "#334155", fontWeight: "600" },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 10 },
  infoGrid: { gap: 8 },
  infoCol: { marginBottom: 8 },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: "#334155",
    marginTop: 10,
    marginBottom: 6,
  },
  actionRow: { marginTop: 12, flexDirection: "row", flexWrap: "wrap", gap: 8 },
  actionBtn: {
    backgroundColor: "#0284C7",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: "center",
    marginRight: 8,
    marginBottom: 8,
  },
  actionBtnText: { color: "#FFFFFF", fontWeight: "700", fontSize: 13 },
});
