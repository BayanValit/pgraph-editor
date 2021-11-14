export interface objectInterface {
    hasSelected: boolean;
    hasOpenMenu: boolean;
    hasCaptured: boolean;
    highlighted: boolean;
    isActive: boolean;

    select();
    unselect();
    openMenu();
    closeMenu();
    drag();
    drop();
    highlight();
    active();
}
