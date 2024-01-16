import Component from "@glimmer/component";
import { tracked } from "@glimmer/tracking";
import { action } from "@ember/object";
import { inject as service } from "@ember/service";

import DoNotDisturbModal from "discourse/components/modal/do-not-disturb";
import UserStatusModal from "discourse/components/modal/user-status";
import { ajax } from "discourse/lib/ajax";
import DoNotDisturb from "discourse/lib/do-not-disturb";
import { userPath } from "discourse/lib/url";

const _extraItems = [];
export default class HeaderUserNew extends Component {
  @service currentUser;
  @tracked isActive = false;
  @service siteSettings;
  @service userStatus;
  @service modal;

  saving = false;

  constructor() {
    super(...arguments);
    this.handleDocumentClick = this.handleDocumentClick.bind(this);
  }

  @action
  toggleDropdown() {
    this.isActive = !this.isActive;

    if (this.isActive) {
      setTimeout(() => {
        document.addEventListener("click", this.handleDocumentClick);
      }, 0);
    } else {
      document.removeEventListener("click", this.handleDocumentClick);
    }
  }

  handleDocumentClick(event) {
    const dropdown = document.querySelector(".header-user-new__menu");
    const isClickInside = dropdown.contains(event.target);

    if (!isClickInside) {
      this.isActive = false;
      document.removeEventListener("click", this.handleDocumentClick);
    }
  }

  willDestroy() {
    super.willDestroy();
    document.removeEventListener("click", this.handleDocumentClick);
  }
  //Add user Tab buttons
  get showToggleAnonymousButton() {
    return (
      (this.siteSettings.allow_anonymous_posting &&
        this.siteSettings.userInAnyGroups(
          "anonymous_posting_allowed_groups",
          this.currentUser
        )) ||
      this.currentUser.is_anonymous
    );
  }

  get isInDoNotDisturb() {
    return !!this.#doNotDisturbUntilDate;
  }

  get doNotDisturbDateTime() {
    return this.#doNotDisturbUntilDate.getTime();
  }

  get showDoNotDisturbEndDate() {
    return !DoNotDisturb.isEternal(
      this.currentUser.get("do_not_disturb_until")
    );
  }

  get extraItems() {
    return _extraItems;
  }

  get #doNotDisturbUntilDate() {
    if (!this.currentUser.get("do_not_disturb_until")) {
      return;
    }
    const date = new Date(this.currentUser.get("do_not_disturb_until"));
    if (date < new Date()) {
      return;
    }
    return date;
  }

  @action
  doNotDisturbClick() {
    if (this.saving) {
      return;
    }
    this.saving = true;
    if (this.currentUser.do_not_disturb_until) {
      return this.currentUser.leaveDoNotDisturb().finally(() => {
        this.saving = false;
      });
    } else {
      this.saving = false;
      this.args.closeUserMenu();
      this.modal.show(DoNotDisturbModal);
    }
  }

  @action
  setUserStatusClick() {
    this.args.closeUserMenu();

    this.modal.show(UserStatusModal, {
      model: {
        status: this.currentUser.status,
        pauseNotifications: this.currentUser.isInDoNotDisturb(),
        saveAction: (status, pauseNotifications) =>
          this.userStatus.set(status, pauseNotifications),
        deleteAction: () => this.userStatus.clear(),
      },
    });
  }

  @action
  async toggleAnonymous() {
    await ajax(userPath("toggle-anon"), { type: "POST" });
    window.location.reload();
  }
}